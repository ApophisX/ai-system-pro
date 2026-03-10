import { Box, Badge, Stack, Typography } from "@mui/material";

import { formatCode } from "src/utils/format-text";

import { fDateTime } from "src/utils";
import { ossUploader } from "src/lib/oss-uploader";

import { Image } from "src/components/image";
import { HorizontalStack } from "src/components/custom/layout";


export function AssetInventoryBindInfoCard({ inventory }: { inventory?: MyApi.OutputAssetInventoryDto }) {

  if (!inventory) return null;
  return (
    <Stack direction="row" spacing={1.5} sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => theme.vars.palette.background.neutral, }} >
      {/* 实例图片 */}
      {inventory.images && inventory.images.length > 0 && (
        <Badge badgeContent={inventory.images.length > 1 ? inventory.images.length : undefined} color="info" showZero>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {inventory.images.map((image, index) => (
              <Image
                key={index}
                src={ossUploader.getSignatureUrl(image)}
                alt={`实例图片 ${index + 1}`}
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 1,
                  objectFit: 'cover',
                }}
              />
            ))}
          </Box>
        </Badge>
      )}

      <Stack flex={1}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {inventory.instanceName}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {formatCode(inventory.instanceCode, 6)}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <HorizontalStack spacing={0} justifyContent="space-between">
          <Typography variant="caption" sx={{}}>
            绑定时间：
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {fDateTime(inventory.boundAt)}
          </Typography>
        </HorizontalStack>
      </Stack>

    </Stack>
  )
}