'use client';

import { GoogleIcon } from '@/lib/icons/GoogleIcon';
import styles from './SmallBtn.module.css';
import { SmallBtnPart, SmallBtnPartOutline } from '@/lib/icons/SmallBtnPart';
import { BigBtnIcon, BigBtnOutlineIcon } from '@/lib/icons/BigBtnIcon';
import { cva, VariantProps } from 'class-variance-authority';
import { TwitchIcon } from '@/lib/icons/TwitchIcon';
import { InfoIcon } from '@/lib/icons/InfoIcon';
import clsx from 'clsx';
import Link from 'next/link';

const variants = cva(styles.btn, {
    variants: {
        disabled: {
            true: styles.disabled,
        },
        icon: {
            twitch: '',
            google: '',
            info: '',
        },
        style: {
            default: styles.default,
            twitch: styles.twitch,
            google: styles.google,
            outline_bright: styles.outline_bright,
            outline_dark: styles.outline_dark,
            outline_red: styles.outline_red,
            outline_brand: styles.outline_brand,
        },
        weight: {
            medium: styles.medium_weight,
            semibold: styles.semibold_weight,
        },
        big: {
            true: styles.big,
        },
    },
    defaultVariants: {
        disabled: false,
        icon: null,
        style: 'default',
        weight: 'medium',
        big: false,
    },
});

interface SmallBtnProps extends VariantProps<typeof variants> {
    text?: string;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    href?: string;
}

const Icon = ({ name }: { name: 'twitch' | 'google' | 'info' }) => {
    switch (name) {
        case 'twitch':
            return <TwitchIcon className={clsx(styles.icon, styles.icon_fill)} />;
        case 'google':
            return <GoogleIcon className={clsx(styles.icon, styles.icon_fill)} />;
        case 'info':
            return <InfoIcon className={clsx(styles.icon, styles.icon_stroke)} />;
    }

    return null;
};

export const AppBtn = ({
    text,
    className,
    onClick,
    disabled,
    icon,
    style,
    weight,
    big,
    href,
}: SmallBtnProps) => {
    const isOutline =
        style === 'outline_bright' ||
        style === 'outline_dark' ||
        style === 'outline_red' ||
        style === 'outline_brand';

    const content = (
        <>
            <div className={styles.content}>
                {icon && <Icon name={icon} />}
                {text && <p>{text}</p>}
            </div>
            {big ? (
                !isOutline ? (
                    <BigBtnIcon className={styles.part_icon} />
                ) : null
            ) : !isOutline ? (
                <SmallBtnPart className={styles.part_icon} />
            ) : null}

            {isOutline &&
                (big ? (
                    <BigBtnOutlineIcon className={styles.outline_part_icon} />
                ) : (
                    <SmallBtnPartOutline className={styles.outline_part_icon} />
                ))}
        </>
    );

    const classes = clsx(variants({ disabled, style, weight, icon, big }), className);

    if (href) {
        if (disabled) {
            return <span className={classes}>{content}</span>;
        }

        return (
            <Link href={href} className={classes} onClick={onClick}>
                {content}
            </Link>
        );
    }

    return (
        <button
            className={classes}
            onClick={() => {
                if (disabled) return;
                onClick?.();
            }}
            disabled={disabled}
        >
            {content}
        </button>
    );
};
