'use client';

import Hero from "@/components/Hero/Hero";
import Intermezzo from "@/components/Intermezzo/Intermezzo";
import PropertyHero from "@/components/PropertyHero/PropertyHero";
import Testimonials from "@/components/Testimonials/Testimonials";
import LocationSection from "@/components/Location/LocationSection";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { useTranslation } from "@/context/LanguageContext";

export default function Home() {
  const [properties, setProperties] = useState<any[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          amenities (*),
          property_images (*)
        `)
        .order('created_at', { ascending: false });
      
      if (data) setProperties(data);
    };
    fetchProperties();
  }, []);

  return (
    <main>
      <Hero />

      {/* Painting-inspired divider */}
      <hr className="section-divider" />

      {/* Cinematic Intermezzo — Hummingbird Oil Painting */}
      <Intermezzo />

      {/* Painting-inspired divider */}
      <hr className="section-divider" />

      {/* Property Section Header */}
      <section style={{
        padding: '8rem 1rem 4rem',
        backgroundColor: 'var(--bg-dark)',
        textAlign: 'center'
      }}>
        <p style={{
          color: 'var(--primary)',
          fontWeight: 700,
          letterSpacing: '0.1em',
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          marginBottom: '1rem',
        }}>{t.hero.badge}</p>
        <h2 style={{
          fontSize: '3.5rem',
          fontWeight: 800,
          color: 'white',
          letterSpacing: '-0.02em',
          marginBottom: '1.5rem',
        }}>{t.hero.properties}</h2>
        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          maxWidth: '36rem',
          fontSize: '1.25rem',
          margin: '0 auto',
          lineHeight: 1.6
        }}>{t.hero.subtitle}</p>
      </section>

      {/* Property Hero Sections */}
      {properties.map((property, idx) => (
        <PropertyHero key={idx} property={property} index={idx} />
      ))}

      {properties.length === 0 && (
        <section style={{ padding: '5rem 0', textAlign: 'center', backgroundColor: 'var(--bg-dark)' }}>
          <p style={{ color: 'white', opacity: 0.6 }}>No properties found.</p>
        </section>
      )}


      {/* Painting-inspired divider */}
      <hr className="section-divider" />

      <LocationSection />

      {/* Painting-inspired divider */}
      <hr className="section-divider" />

      <Testimonials />
    </main>
  );
}
