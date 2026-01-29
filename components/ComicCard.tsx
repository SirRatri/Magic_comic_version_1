'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Comic } from '@/types';

export default function ComicCard({ comic }: { comic: Comic }) {
  return (
    <Link href={`/truyen/${comic.slug}`} className="block group">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-800">
        <Image
          src={comic.thumbnail}
          alt={comic.title}
          fill
          sizes="(max-width: 768px) 50vw, 20vw" // Mobile tải ảnh nhỏ, PC tải ảnh to
          className="object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <h3 className="mt-2 text-sm font-semibold truncate text-white">{comic.title}</h3>
      <p className="text-xs text-gray-400">{comic.author}</p>
    </Link>
  );
}