import type { DialogProps } from '@toolpad/core/useDialogs';

import { useRef, useState, useEffect, useCallback } from 'react';

import { Box, Stack, Button, Divider, Typography } from '@mui/material';

import { toast } from 'src/components/snackbar';

import { MyDialog } from '../my-dialog';
import { HorizontalStack } from '../layout';

/** 将 canvas 转为 PNG File */
function canvasToPngFile(canvas: HTMLCanvasElement, filename = 'signature.png'): File {
  const dataUrl = canvas.toDataURL('image/png');
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] ?? 'image/png';
  const bstr = atob(arr[1] ?? '');
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}
type AutographDialogProps = DialogProps<any, File | null>;
export function AutographDialog(props: AutographDialogProps) {
  const { open, onClose } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const [hasSignature, setHasSignature] = useState(false);

  const pushedRef = useRef(false);
  const ignoreNextPopRef = useRef(false);
  const onCloseRef = useRef(onClose);

  // 记录签名次数
  const signatureCount = useRef(0);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const closeDialog = useCallback(
    (result: File | null) => {
      onClose(result);
      if (pushedRef.current) {
        ignoreNextPopRef.current = true;
        window.history.back();
      }
    },
    [onClose]
  );

  const getCanvasPoint = useCallback((e: React.PointerEvent | PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    // canvas 使用 ctx.scale(dpr)，绘制坐标为逻辑坐标 (0~rect.width, 0~rect.height)
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = container.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);
    if (w <= 0 || h <= 0) return;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => initCanvas());
      return () => cancelAnimationFrame(raf);
    }
    return undefined;
  }, [open, initCanvas]);

  useEffect(() => {
    const handleResize = () => {
      if (open) initCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open, initCanvas]);

  const draw = useCallback((from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !from || !to) return;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
      const p = getCanvasPoint(e);
      if (!p) return;
      isDrawingRef.current = true;
      lastPointRef.current = p;
      setHasSignature(true);
    },
    [getCanvasPoint]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawingRef.current || !lastPointRef.current) return;
      e.preventDefault();
      const p = getCanvasPoint(e);
      if (!p) return;

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        draw(lastPointRef.current!, p);
        lastPointRef.current = p;
        rafRef.current = null;
      });
    },
    [getCanvasPoint, draw]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLCanvasElement).releasePointerCapture(e.pointerId);
    isDrawingRef.current = false;
    lastPointRef.current = null;
    signatureCount.current++;
  }, []);

  const handlePointerLeave = useCallback(() => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
    signatureCount.current++;
  }, []);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    setHasSignature(false);
    signatureCount.current = 0;
  }, []);

  const handleConfirm = useCallback(() => {
    if (signatureCount.current === 0) {
      toast.error('请先签名');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) {
      closeDialog(null);
      return;
    }
    if (!hasSignature) {
      closeDialog(null);
      return;
    }
    try {
      const file = canvasToPngFile(canvas);
      closeDialog(file);
    } catch {
      closeDialog(null);
    }
  }, [closeDialog, hasSignature]);

  const handleClose = useCallback(() => {
    closeDialog(null);
  }, [closeDialog]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    if (!pushedRef.current) {
      pushedRef.current = true;
      const dialogId = Math.random().toString(36).slice(2) + Date.now().toString(36);
      window.history.pushState(
        { __dialogType: 'autograph', __dialogId: dialogId },
        '',
        window.location.href
      );
    }

    const handlePopState = () => {
      if (ignoreNextPopRef.current) {
        ignoreNextPopRef.current = false;
        return;
      }
      onCloseRef.current(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [open]);

  return (
    <MyDialog
      dialogTitle="签名"
      open={open}
      onClose={handleClose}
      fullScreen
      showActionButtons={false}
    >
      <HorizontalStack flex={1} spacing={0} sx={{ height: '100%', minHeight: 0 }}>
        <Stack sx={{ width: 100, height: '100%', minHeight: 0 }} p={2} spacing={1}>
          <Button
            variant="outlined"
            size="medium"
            sx={{
              textAlign: 'center',
              cursor: 'pointer',
              flex: 1,
              p: 0,
            }}
            onClick={handleClear}
          >
            <Typography variant="h6" sx={{ transform: 'rotate(90deg)' }}>
              清除
            </Typography>
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            sx={{
              textAlign: 'center',
              cursor: 'pointer',
              flex: 1,
              p: 0,
            }}
            onClick={handleConfirm}
          >
            <Typography variant="h6" sx={{ transform: 'rotate(90deg)' }}>
              确认
            </Typography>
          </Button>
        </Stack>
        <Divider orientation="vertical" flexItem sx={{ mx: 0, borderStyle: 'dashed' }} />
        <Box
          ref={containerRef}
          sx={{
            flex: 1,
            height: '100%',
            minHeight: 0,
            touchAction: 'none',
            userSelect: 'none',
            cursor: 'crosshair',
          }}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            onPointerCancel={handlePointerUp}
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              backgroundColor: '#fff',
            }}
          />
        </Box>
      </HorizontalStack>
    </MyDialog>
  );
}
