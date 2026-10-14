import React from 'react'
import Link from 'next/link'
import * as Icon from "@phosphor-icons/react/dist/ssr";

interface Pros {
    heading: string
    subHeading: string
}

const Breadcrumb: React.FC<Pros> = ({ heading, subHeading }) => {
    return (
        <>
            <div className="breadcrumb-block style-shared">
                <div className="breadcrumb-main bg-linear overflow-hidden">
                    <div className="container lg:pt-[134px] pt-24 pb-10 relative">
                        <div className="main-content w-full h-full flex flex-col items-center justify-center relative z-[1]">
                            <div className="text-content">
                                <h1 className="heading2 text-center">{heading}</h1> 
                                <div className="link flex items-center justify-center gap-1 caption1 mt-3">
                                    <Link href={'/'}>Inicio</Link>
                                    <Icon.CaretRight size={14} className='text-text-muted' />
                                    <div className='text-text-muted capitalize'>{subHeading}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Breadcrumb