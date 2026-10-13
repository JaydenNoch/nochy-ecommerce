'use client'

import { useState } from 'react'
import Link from 'next/link'

const categories = {
  man: [
    { label: 'Formal',      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80' },
    { label: 'Casual',      img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80' },
    { label: 'Outerwear',   img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80' },
    { label: 'Traditional', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80' },
    { label: 'Sport',       img: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=600&q=80' },
    { label: 'Denim',       img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80' },
    { label: 'Streetwear',  img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80' },
    { label: 'Accessories', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80' },
  ],
  woman: [
    { label: 'Formal',      img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80' },
    { label: 'Casual',      img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80' },
    { label: 'Outerwear',   img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80' },
    { label: 'Traditional', img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80' },
    { label: 'Sport',       img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80' },
    { label: 'Denim',       img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80' },
    { label: 'Streetwear',  img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80' },
    { label: 'Accessories', img: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=600&q=80' },
  ],
}

type Gender = 'man' | 'woman'

export default function CategoriesSection() {
  const [activeTab, setActiveTab] = useState<Gender>('man')

  return (
    <section className="cat-section">

      {/* Header */}
      <div className="cat-header">
        <h2 className="cat-title">CATEGORIES</h2>

        {/* Tab switcher */}
        <div className="cat-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('man')}
            className={`cat-tab ${activeTab === 'man' ? 'active' : ''}`}
          >
            MAN
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('woman')}
            className={`cat-tab ${activeTab === 'woman' ? 'active' : ''}`}
          >
            WOMAN
          </button>
        </div>
      </div>

      {/* Grid kategori — hanya tampilkan yang aktif */}
      <div className="cat-grid">
        {categories[activeTab].map((cat) => (
          <Link
            key={cat.label}
            href={`/?category=${activeTab}&sub=${cat.label.toLowerCase()}`}
            className="cat-card"
          >
            {/* Gambar background */}
            <div className="cat-card-img">
              <img src={cat.img} alt={cat.label} />
            </div>

            {/* Label overlay */}
            <div className="cat-card-label">
              <span>{cat.label}</span>
            </div>
          </Link>
        ))}
      </div>

    </section>
  )
}
