import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const SOURCE_DIR = path.join(__dirname, '..', 'fotos', 'Lovelyhome fotos');
const PUBLIC_DIR = path.join(__dirname, '..', 'public', 'images', 'properties');

// Map property name prefix to folder name and property name pattern
const PROPERTY_MAP: Record<string, { folder: string; namePattern: string }> = {
    'AMARILO 201': { folder: 'amarillo-201', namePattern: 'Amarilo 201' },
    'AMARILO 202': { folder: 'amarillo-202', namePattern: 'Amarilo 202' },
    'AMARILO 301': { folder: 'amarillo-301', namePattern: 'Amarilo 301' },
    'ARUNA 201':   { folder: 'aruna-201',    namePattern: 'Aruna 201' },
    'ARUNA 202':   { folder: 'aruna-202',    namePattern: 'Aruna 202' },
};

// Also catch "AMARILO 2020" as Amarilo 202
function getPropertyPrefix(filename: string): string | null {
    const upper = filename.toUpperCase();
    if (upper.startsWith('AMARILO 2020')) return 'AMARILO 202';
    for (const prefix of Object.keys(PROPERTY_MAP)) {
        if (upper.startsWith(prefix)) return prefix;
    }
    return null;
}

async function run() {
    // 1. Fetch all properties
    const { data: props } = await supabase.from('properties').select('id, name');
    if (!props) { console.error('Could not fetch properties'); return; }

    // 2. Get existing images from DB
    const { data: existingImages } = await supabase
        .from('property_images')
        .select('property_id, image_url');

    // 3. Build a set of existing file sizes per property folder to detect duplicates
    const existingSizes: Record<string, Set<number>> = {};
    for (const folder of Object.values(PROPERTY_MAP).map(m => m.folder)) {
        existingSizes[folder] = new Set();
        const folderPath = path.join(PUBLIC_DIR, folder);
        if (fs.existsSync(folderPath)) {
            for (const file of fs.readdirSync(folderPath)) {
                const stat = fs.statSync(path.join(folderPath, file));
                existingSizes[folder].add(stat.size);
            }
        }
        // Also add the main image size
        const mainPath = path.join(PUBLIC_DIR, `${folder}.jpg`);
        if (fs.existsSync(mainPath)) {
            existingSizes[folder].add(fs.statSync(mainPath).size);
        }
    }

    // 4. Read source files and filter by property prefix
    const sourceFiles = fs.readdirSync(SOURCE_DIR).filter(f => {
        const ext = path.extname(f).toLowerCase();
        return (ext === '.jpg' || ext === '.jpeg' || ext === '.png') && getPropertyPrefix(f) !== null;
    });

    console.log(`Found ${sourceFiles.length} properly named source photos.\n`);

    // Group by property
    const grouped: Record<string, string[]> = {};
    for (const file of sourceFiles) {
        const prefix = getPropertyPrefix(file)!;
        if (!grouped[prefix]) grouped[prefix] = [];
        grouped[prefix].push(file);
    }

    const existingUrlSet = new Set((existingImages || []).map(i => i.image_url));

    for (const [prefix, files] of Object.entries(grouped)) {
        const config = PROPERTY_MAP[prefix];
        const prop = props.find(p => {
            const nameObj = typeof p.name === 'string' ? JSON.parse(p.name) : p.name;
            return (nameObj?.es || '').includes(config.namePattern);
        });
        if (!prop) { console.log(`⚠️  No DB property for "${prefix}"`); continue; }

        const destFolder = path.join(PUBLIC_DIR, config.folder);
        if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, { recursive: true });

        // Get current max display_order
        const { data: currentImgs } = await supabase
            .from('property_images')
            .select('display_order')
            .eq('property_id', prop.id)
            .order('display_order', { ascending: false })
            .limit(1);
        let nextOrder = (currentImgs?.[0]?.display_order ?? -1) + 1;

        console.log(`📸 ${config.namePattern} — ${files.length} source files, checking for new ones...`);

        let added = 0;
        for (const file of files) {
            const srcPath = path.join(SOURCE_DIR, file);
            const srcSize = fs.statSync(srcPath).size;

            // Skip if same file size already exists (duplicate photo)
            if (existingSizes[config.folder].has(srcSize)) {
                continue;
            }

            // Create a clean filename
            const cleanName = file
                .replace(/[^a-zA-Z0-9._-]/g, '_')
                .replace(/__+/g, '_')
                .toLowerCase();
            
            const destPath = path.join(destFolder, cleanName);
            const publicUrl = `/images/properties/${config.folder}/${cleanName}`;

            // Skip if URL already in DB
            if (existingUrlSet.has(publicUrl)) continue;

            // Copy file
            fs.copyFileSync(srcPath, destPath);
            existingSizes[config.folder].add(srcSize);

            // Insert into DB
            const { error } = await supabase.from('property_images').insert({
                property_id: prop.id,
                image_url: publicUrl,
                display_order: nextOrder++,
            });

            if (error) {
                console.log(`  ❌ Error inserting ${cleanName}: ${error.message}`);
            } else {
                added++;
            }
        }

        console.log(`  ✅ Added ${added} NEW photos (skipped ${files.length - added} duplicates)\n`);
    }

    console.log('🎉 Photo expansion complete!');
}

run();
