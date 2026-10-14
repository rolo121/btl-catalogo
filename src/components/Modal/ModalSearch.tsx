'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Icon from '@phosphor-icons/react/dist/ssr'
import { useModalSearchContext } from '@/context/ModalSearchContext'

const suggestedKeywords = [
    'termos',
    'bolígrafos',
    'tazas',
    'bolsas',
    'libretas',
    'tecnología',
]

const ModalSearch = () => {
    const { isModalOpen, closeModalSearch } = useModalSearchContext()
    const [searchKeyword, setSearchKeyword] = useState('')
    const inputRef = useRef<HTMLInputElement | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (!isModalOpen) return

        const timer = window.setTimeout(() => {
            inputRef.current?.focus()
        }, 180)

        return () => window.clearTimeout(timer)
    }, [isModalOpen])

    const handleSearch = (value: string) => {
        const nextValue = value.trim()

        if (!nextValue) return

        router.push(`/buscar?query=${encodeURIComponent(nextValue)}`)
        closeModalSearch()
        setSearchKeyword('')
    }

    return (
        <div
            className={`modal-search-block ${isModalOpen ? 'open' : ''}`}
            onClick={closeModalSearch}
            aria-hidden={!isModalOpen}
        >
            <div
                className={`modal-search-main md:p-10 p-6 rounded-[32px] ${isModalOpen ? 'open' : ''}`}
                onClick={(e) => {
                    e.stopPropagation()
                }}
            >
                <div className="form-search relative">
                    <Icon.MagnifyingGlass
                        className="absolute heading5 right-6 top-1/2 -translate-y-1/2 cursor-pointer"
                        onClick={() => handleSearch(searchKeyword)}
                    />

                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Buscar productos promocionales..."
                        className="text-button-lg h-14 rounded-2xl border border-line w-full pl-6 pr-12"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch(searchKeyword)
                            }
                        }}
                    />
                </div>

                <div className="keyword mt-8">
                    <div className="heading5">Búsquedas sugeridas</div>

                    <div className="list-keyword flex items-center flex-wrap gap-3 mt-4">
                        {suggestedKeywords.map((keyword) => (
                            <button
                                key={keyword}
                                type="button"
                                className="item px-4 py-1.5 border border-line rounded-full cursor-pointer duration-300 hover:bg-black hover:text-white"
                                onClick={() => handleSearch(keyword)}
                            >
                                {keyword}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalSearch
