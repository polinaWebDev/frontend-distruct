'use client';

import { BigBtnIcon } from '@/lib/icons/BigBtnIcon';
import { ChevronRightIcon } from '@/lib/icons/ChevronRightIcon';

import styles from './HeaderProfileBtn.module.css';
import { Root } from '@radix-ui/react-dialog';
import { AuthDialog } from '../AuthDialog/AuthDialog';
import { useState } from 'react';
import { UserResponseDto } from '@/lib/api_client/gen';
import { GameType } from '@/lib/enums/game_type.enum';
import { useRouter } from 'next/navigation';

export const HeaderProfileBtn = ({
    user,
    game,
    onClick,
}: {
    user?: UserResponseDto;
    game: GameType;
    onClick?: () => void;
}) => {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    return (
        <Root open={open} onOpenChange={setOpen}>
            <button
                className={styles.container}
                onClick={() => {
                    if (!user) {
                        setOpen(true);
                    } else {
                        router.push('/profile?game=' + game);
                        setOpen(false);
                    }
                    onClick?.();
                }}
            >
                <div className={styles.content}>
                    <p>{user ? 'Личный кабинет' : 'Войти'}</p>

                    <ChevronRightIcon className={styles.chevron} />
                </div>

                <BigBtnIcon className={styles.icon} />
            </button>

            {/* {user && (
                <button
                    onClick={() => {
                        logout().then(() => {
                            window.location.reload();
                        });
                    }}
                    className={styles.logout_btn}
                >
                    <LogOut />
                </button>
            )} */}

            <AuthDialog
                onClose={() => {
                    console.log('close');
                    setOpen(false);
                }}
            />
        </Root>
    );
};
