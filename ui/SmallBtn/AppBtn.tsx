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
import { CSSProperties } from 'react';

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
    contentClassName?: string;
    textClassName?: string;
    disabled?: boolean;
    href?: string;
    colorProps?: {
        bgColor?: string;
        textColor?: string;
        hoverBgColor?: string;
        hoverTextColor?: string;
        partColor?: string;
        partHoverColor?: string;
        borderColor?: string;
        hoverBorderColor?: string;
        outlineBgColor?: string;
        outlineHoverBgColor?: string;
    };
    inlineStyle?: CSSProperties;
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
    contentClassName,
    textClassName,
    onClick,
    disabled,
    icon,
    style,
    weight,
    big,
    href,
    colorProps,
    inlineStyle,
}: SmallBtnProps) => {
    const isOutline =
        style === 'outline_bright' ||
        style === 'outline_dark' ||
        style === 'outline_red' ||
        style === 'outline_brand';

    const content = (
        <>
            <div className={clsx(styles.content, contentClassName)}>
                {icon && <Icon name={icon} />}
                {text && <p className={textClassName}>{text}</p>}
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
    const cssVars = {
        ...(colorProps?.bgColor ? ({ '--app-btn-bg': colorProps.bgColor } as CSSProperties) : {}),
        ...(colorProps?.textColor
            ? ({ '--app-btn-text': colorProps.textColor } as CSSProperties)
            : {}),
        ...(colorProps?.hoverBgColor
            ? ({ '--app-btn-hover-bg': colorProps.hoverBgColor } as CSSProperties)
            : {}),
        ...(colorProps?.hoverTextColor
            ? ({ '--app-btn-hover-text': colorProps.hoverTextColor } as CSSProperties)
            : {}),
        ...(colorProps?.partColor
            ? ({ '--app-btn-part': colorProps.partColor } as CSSProperties)
            : {}),
        ...(colorProps?.partHoverColor
            ? ({ '--app-btn-part-hover': colorProps.partHoverColor } as CSSProperties)
            : {}),
        ...(colorProps?.borderColor
            ? ({ '--app-btn-border': colorProps.borderColor } as CSSProperties)
            : {}),
        ...(colorProps?.hoverBorderColor
            ? ({ '--app-btn-hover-border': colorProps.hoverBorderColor } as CSSProperties)
            : {}),
        ...(colorProps?.outlineBgColor
            ? ({ '--app-btn-outline-bg': colorProps.outlineBgColor } as CSSProperties)
            : {}),
        ...(colorProps?.outlineHoverBgColor
            ? ({ '--app-btn-outline-hover-bg': colorProps.outlineHoverBgColor } as CSSProperties)
            : {}),
        ...inlineStyle,
    } as CSSProperties;

    if (href) {
        if (disabled) {
            return (
                <span className={classes} style={cssVars}>
                    {content}
                </span>
            );
        }

        return (
            <Link href={href} className={classes} onClick={onClick} style={cssVars}>
                {content}
            </Link>
        );
    }

    return (
        <button
            className={classes}
            style={cssVars}
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
