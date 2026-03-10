import { QRCodeCanvas } from 'qrcode.react';
import { Copy, Users, Share2 } from 'lucide-react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';

import { CONFIG } from 'src/global-config';

import { toast } from 'src/components/snackbar';
import { MobileLayout } from 'src/components/custom/layout';

// ----------------------------------------------------------------------

export default function InviteView() {
  const inviteCode = 'XUNWU888';
  const inviteLink = 'https://xunwu.app/invite/XUNWU888';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('复制成功', { id: 'copy-success' });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '藏宝壳 - 您的闲置物品租赁平台',
          text: '快来加入藏宝壳，这里有海量物品等你来租！填写我的邀请码：' + inviteCode,
          url: inviteLink,
        });
      } catch (error) {
        console.log('分享取消');
      }
    } else {
      handleCopy(inviteLink);
      toast.success('链接已复制，快去分享吧');
    }
  };

  const inviteHistory = [
    { id: 1, name: '李明', avatar: '', date: '2023-12-20', status: '已注册' },
    { id: 2, name: '王芳', avatar: '', date: '2023-12-18', status: '已认证' },
    { id: 3, name: '张伟', avatar: '', date: '2023-12-15', status: '已下单' },
  ];

  return (
    <MobileLayout appTitle="邀请好友" containerProps={{ maxWidth: 'md', sx: { py: 3 } }}>
      {/* 邀请卡片 */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 2,
          textAlign: 'center',
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'common.white',
        }}
      >
        <Users size={48} style={{ opacity: 0.8, marginBottom: 16 }} />
        <Typography variant="h5" gutterBottom>
          邀请好友赚奖励
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mb: 3, maxWidth: 300, mx: 'auto' }}>
          每邀请一位好友注册并完成实名认证，您和好友都将获得 100 积分奖励。
        </Typography>

        {/* 二维码邀请码 */}
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ mb: 3 }}>
          <Box sx={{ borderRadius: 1, overflow: 'hidden', height: 200, width: 200 }}>
            <QRCodeCanvas
              value={inviteLink}
              size={200}
              marginSize={2}
              level="H"
              imageSettings={{
                src: `${CONFIG.assetsDir}/assets/icons/apps/ic-app-1.webp`,
                height: 40,
                width: 40,
                excavate: true,
                crossOrigin: 'anonymous',
              }}
            />
          </Box>
        </Box>

        {/* 我的邀请码 */}
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            mb: 3,
            borderRadius: 1,
          }}
        >
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              我的邀请码
            </Typography>
            <Typography variant="h6" sx={{ letterSpacing: 2, color: 'common.white' }}>
              {inviteCode}
            </Typography>
          </Box>
          {/* <Tooltip title="复制邀请码">
            <IconButton onClick={() => handleCopy(inviteCode)} sx={{ color: 'common.white' }}>
              <Copy size={20} />
            </IconButton>
          </Tooltip> */}
        </Paper>

        <Button
          variant="contained"
          size="large"
          startIcon={<Share2 size={20} />}
          onClick={handleShare}
          sx={{
            bgcolor: 'common.white',
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.9)',
            },
            px: 4,
          }}
        >
          立即邀请
        </Button>
      </Paper>

      {/* 邀请记录 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          邀请记录
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          共邀请 {inviteHistory.length} 人
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <List disablePadding>
          {inviteHistory.map((item, index) => (
            <div key={item.id}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>{item.name[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={item.name}
                  secondary={item.date}
                  primaryTypographyProps={{ variant: 'subtitle2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2" color="success.main">
                    +100 积分
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {item.status}
                  </Typography>
                </Box>
              </ListItem>
              {index < inviteHistory.length - 1 && <Divider variant="inset" component="li" />}
            </div>
          ))}
        </List>
      </Paper>
    </MobileLayout>
  );
}
