import React from "react";
import * as Icon from "@phosphor-icons/react/dist/ssr";

interface RateProps {
    currentRate: number | undefined
    size: number
}

const Rate: React.FC<RateProps> = ({ currentRate, size }) => {
    const arrOfStar = [];
    for (let i = 0; i < 5; i++) {
        if (currentRate) {
            if (i >= currentRate) {
                arrOfStar.push(<Icon.Star key={i} size={size} color="#9FA09C" weight="fill" />);
            } else {
                arrOfStar.push(<Icon.Star key={i} size={size} color="var(--brand-secondary)" weight="fill" />);
            }
        }
    }
    return <div className="rate flex">{arrOfStar}</div>;
}

export default Rate