'use client'

import React from 'react'
import Link from 'next/link';

interface Props {
    props: string;
    slogan: string;
}

const TopNavOne: React.FC<Props> = ({ props, slogan }) => {

    return (
        <>
            <div className={`top-nav md:h-[44px] h-[28px] ${props}`}>
                <div className="container mx-auto h-full">
                    <div className="top-nav-main flex justify-between max-md:justify-center h-full">
                        <div className="left-content flex items-center gap-5 max-md:hidden">
                           
                        </div>
                        <div className="flex items-center justify-center text-center text-white">
                        <span className="max-w-[330px] px-3 text-[9px] font-bold uppercase leading-[12px] tracking-[0.03em] md:max-w-none md:px-0 md:text-[12px] md:leading-[16px]">
                            {slogan}
                        </span>
                        </div>
                        <div className="right-content flex items-center gap-5 max-md:hidden">
                            <Link href={'https://www.facebook.com/people/BTL Marketing/61569144617816/'} target='_blank'>
                                <i className="icon-facebook text-white"></i>
                            </Link>
                            <Link href={'https://www.instagram.com/btlmarketing/?hl=es'} target='_blank'>
                                <i className="icon-instagram text-white"></i>
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}

export default TopNavOne
