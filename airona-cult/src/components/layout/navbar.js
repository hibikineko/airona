import React, { useState } from 'react';
import Link from 'next/link';
import { Drawer, IconButton, List, ListItemIcon, ListItemText, ListItemButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import EventIcon from '@mui/icons-material/Event';
import ForumIcon from '@mui/icons-material/Forum';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import PublicIcon from '@mui/icons-material/Public';
import InfoIcon from '@mui/icons-material/Info';

const navOptions = [
    { label: 'Home', icon: <HomeIcon />, path: '/' },
    { label: 'Latest News', icon: <NewspaperIcon />, path: '/news' },
    { label: 'Upcoming Events', icon: <EventIcon />, path: '/events' },
    { label: 'Community Posts', icon: <ForumIcon />, path: '/community' },
    { label: 'Gallery', icon: <PhotoLibraryIcon />, path: '/gallery' },
    { label: 'Airona', icon: <PublicIcon />, path: '/airona' },
    { label: 'About Us', icon: <InfoIcon />, path: '/about' },
];

export default function NavbarIcon() {
    const [open, setOpen] = useState(false);

    const handleDrawer = (state) => () => setOpen(state);

    return (
        <>
            <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleDrawer(true)}
                sx={{ mr: 2 }}
            >
                <MenuIcon />
            </IconButton>
            <Drawer anchor="left" open={open} onClose={handleDrawer(false)}>
                <List sx={{ width: 250 }}>
                    {navOptions.map((option) => (
                        <ListItemButton
                            key={option.label}
                            onClick={handleDrawer(false)}
                            component={Link}
                            href={option.path}
                            sx={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <ListItemIcon>{option.icon}</ListItemIcon>
                            <ListItemText primary={option.label} />
                        </ListItemButton>
                    ))}
                </List>
            </Drawer>
        </>
    );
}
