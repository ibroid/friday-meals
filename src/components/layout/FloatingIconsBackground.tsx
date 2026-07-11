"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type AnimatedIcon = {
  id: string;
  url: string;
  left: string;
  animationDuration: string;
  delay: string;
  animationClass: string;
};

export default function FloatingIconsBackground() {
  const [icons, setIcons] = useState<AnimatedIcon[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; iconUrl: string }[]>([]);

  useEffect(() => {
    // Fetch categories with icons
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/public/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories for background", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;

    const spawnIcon = () => {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      const isLeftSide = Math.random() < 0.5;
      const leftPosition = isLeftSide 
        ? Math.random() * 15 + 2 // 2% to 17% (Kiri)
        : Math.random() * 15 + 83; // 83% to 98% (Kanan)
      
      const randomDuration = Math.floor(Math.random() * 21) + 10; // 10 to 30
      
      const newIcon: AnimatedIcon = {
        id: `${randomCategory.id}-${Date.now()}-${Math.random()}`,
        url: randomCategory.iconUrl,
        left: `${leftPosition}%`,
        animationDuration: `${randomDuration}s`,
        delay: '0s',
        animationClass: Math.random() < 0.5 ? "animate-float-up-spin" : "animate-float-up-spin-reverse",
      };

      setIcons((prev) => {
        const activeIcons = prev.slice(-20); // allow up to 20 icons simultaneously
        return [...activeIcons, newIcon];
      });
    };

    // Spawn first icon immediately
    spawnIcon();

    // Interval to spawn a new icon every 3 seconds
    const interval = setInterval(spawnIcon, 3000);

    return () => clearInterval(interval);
  }, [categories]);

  if (icons.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {icons.map((icon) => (
        <div
          key={icon.id}
          className={`absolute bottom-[-100px] opacity-0 ${icon.animationClass}`}
          style={{
            left: icon.left,
            animationDuration: icon.animationDuration,
            animationDelay: icon.delay,
          }}
        >
          <div className="w-8 h-8 relative">
            <Image 
              src={icon.url} 
              alt="" 
              fill 
              sizes="32px" 
              className="object-contain" 
            />
          </div>
        </div>
      ))}
    </div>
  );
}
