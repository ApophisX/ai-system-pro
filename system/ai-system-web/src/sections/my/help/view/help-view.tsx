import { useState } from 'react';
import { Mail, Phone, Search, ChevronDown, MessageCircle } from 'lucide-react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { toast } from 'src/components/snackbar';
import { MobileLayout } from 'src/components/custom/layout';

// ----------------------------------------------------------------------

export default function HelpView() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      question: '如何进行实名认证？',
      answer:
        '进入"我的"页面，点击"实名认证"，按照提示上传身份证正反面照片并填写相关信息即可。审核通常在1-3个工作日内完成。',
    },
    {
      question: '租赁押金如何退还？',
      answer:
        '订单结束后，出租方确认物品无损坏后，系统将在24小时内自动将押金原路退回您的支付账户。',
    },
    {
      question: '如何提高信用分？',
      answer:
        '您可以通过完善个人信息、完成实名认证、多进行租赁交易并按时归还物品等方式来提高您的信用分。',
    },
    {
      question: '物品损坏了怎么办？',
      answer:
        '如果在租赁期间物品发生损坏，请立即联系出租方进行沟通。如果是正常使用磨损无需赔偿；如果是人为损坏，可能需要根据损坏程度进行赔偿。',
    },
    {
      question: '如何发布租赁物品？',
      answer:
        '点击底部导航栏的"发布"按钮，上传物品照片，填写物品描述、租金价格和租赁规则，提交审核后即可发布。',
    },
  ];

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MobileLayout appTitle="帮助中心" containerProps={{ maxWidth: 'md', sx: { pb: 3 } }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        帮助中心
      </Typography>

      {/* 搜索框 */}
      <TextField
        fullWidth
        placeholder="搜索常见问题..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={20} color="#919EAB" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 4 }}
      />

      {/* 自助服务快捷入口 */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          {
            icon: <MessageCircle size={24} />,
            title: '在线客服',
            onClick: () => {
              window.location.href = 'tel:17372631107';
              toast.info('拨打客服电话', { id: 'help-contact-customer-service' });
            },
          },
          {
            icon: <Phone size={24} />,
            title: '电话咨询',
            onClick: () => {
              window.location.href = 'tel:17372631107';
              toast.info('拨打客服电话', { id: 'help-contact-customer-service' });
            },
          },
          {
            icon: <Mail size={24} />,
            title: '意见反馈',
            onClick: () => {
              window.location.href = 'tel:17372631107';
              toast.info('拨打客服电话', { id: 'help-contact-customer-service' });
            },
          },
        ].map((item) => (
          <Grid size={4} key={item.title}>
            <Paper
              variant="outlined"
              sx={{
                py: 2.5,
                textAlign: 'center',
                cursor: 'pointer',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              onClick={item.onClick}
            >
              <Box sx={{ mb: 1, color: 'primary.main', display: 'flex', justifyContent: 'center' }}>
                {item.icon}
              </Box>
              <Typography variant="subtitle2">{item.title}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 常见问题 */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        常见问题
      </Typography>
      <Box sx={{ mb: 4 }}>
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <Accordion
              key={index}
              sx={{ bgcolor: 'transparent', boxShadow: 'none', '&:before': { display: 'none' } }}
            >
              <AccordionSummary
                expandIcon={<ChevronDown size={20} />}
                sx={{
                  px: 0,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="subtitle2">{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, color: 'text.secondary' }}>
                <Typography variant="body2">{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              未找到相关问题
            </Typography>
          </Box>
        )}
      </Box>

      {/* 底部联系 */}
      <Paper
        sx={{
          p: 3,
          textAlign: 'center',
          bgcolor: 'primary.lighter',
          color: 'primary.darker',
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle1" gutterBottom>
          没找到答案？
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
          我们的客服团队随时为您提供帮助
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            window.location.href = 'tel:17372631107';
            toast.info('拨打客服电话', { id: 'help-contact-customer-service' });
          }}
        >
          联系人工客服
        </Button>
      </Paper>
    </MobileLayout>
  );
}
