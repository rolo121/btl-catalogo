export const CART_EXPIRE_KEY = 'cart_expire_time';
export const CART_EXPIRE_DURATION_MS = 15 * 60 * 1000;

export const emptyCountdown = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
};

export const countdownTime = (targetTime?: number | null) => {
    if (!targetTime) {
        return emptyCountdown;
    }

    const currentDate = Date.now();
    const difference = targetTime - currentDate;

    if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        return { days, hours, minutes, seconds };
    }

    return emptyCountdown;
}
