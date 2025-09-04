import React from 'react';
import { Box, Typography, Avatar, Card, CardContent, CardMedia, Button, Stack } from '@mui/material';
import Link from 'next/link';

const MAX_TEXT_LENGTH = 150;

function truncateText(text) {
    if (text.length <= MAX_TEXT_LENGTH) return text;
    return text.slice(0, MAX_TEXT_LENGTH) + '...';
}

const CommunityPostsCarousel = ({ posts }) => {
    return (
        <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', my: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                Community Posts
            </Typography>
            <Box sx={{
                display: 'flex',
                overflowX: 'auto',
                gap: 2,
                py: 2
            }}>
                {posts.map((post, idx) => (
                    <Card key={idx} sx={{ minWidth: 300, flex: '0 0 auto', display: 'flex', flexDirection: 'column', p: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                            <Avatar src={post.ownerProfilePic} alt={post.ownerName} />
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {post.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {post.ownerName}
                                </Typography>
                            </Box>
                        </Stack>
                        <CardContent sx={{ flex: 1 }}>
                            {post.type === 'image' && post.imageUrl ? (
                                <CardMedia
                                    component="img"
                                    image={post.imageUrl}
                                    alt={post.title}
                                    sx={{ borderRadius: 2, mb: 2, maxHeight: 250, objectFit: 'cover' }}
                                />
                            ) : (
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {truncateText(post.text)}
                                    {post.text && post.text.length > MAX_TEXT_LENGTH && (
                                        <Link href="/community-posts" passHref legacyBehavior>
                                            <Button
                                                size="small"
                                                sx={{ ml: 1, textTransform: 'none' }}
                                                component="a"
                                            >
                                                View More
                                            </Button>
                                        </Link>
                                    )}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    );
};

export default CommunityPostsCarousel;
