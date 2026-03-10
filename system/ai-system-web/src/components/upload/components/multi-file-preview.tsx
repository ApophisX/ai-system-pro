import type { Slide, SlideImage, SlideVideo } from 'yet-another-react-lightbox';
import type { UploadProps, FilesUploadType } from '../types';
import type { FileThumbnailProps } from '../../file-thumbnail';

import { useMemo, useCallback } from 'react';
import { varAlpha, mergeClasses } from 'minimal-shared/utils';

import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { fData } from 'src/utils/format-number';

import { Lightbox, useLightbox } from 'src/components/lightbox';

import { Iconify } from '../../iconify';
import { uploadClasses } from '../classes';
import {
  getFileMeta,
  FILE_FORMATS,
  FileThumbnail,
  useFilesPreview,
  getFileExtension,
} from '../../file-thumbnail';

// ----------------------------------------------------------------------

export type PreviewOrientation = 'horizontal' | 'vertical';

export type MultiFilePreviewProps = React.ComponentProps<typeof PreviewList> &
  Pick<UploadProps, 'onRemove'> & {
    files: FilesUploadType;
    startNode?: React.ReactNode;
    endNode?: React.ReactNode;
    orientation?: PreviewOrientation;
    thumbnail?: Omit<FileThumbnailProps, 'file'>;
  };

export function MultiFilePreview({
  sx,
  onRemove,
  className,
  endNode,
  startNode,
  files = [],
  orientation = 'horizontal',
  thumbnail: thumbnailProps,
  ...other
}: MultiFilePreviewProps) {
  const { filesPreview } = useFilesPreview(files);

  const slides = useMemo(() => {
    const imageSliders: Slide[] = files.map((file) => {
      const fileInfo = getFileMeta(file);
      const previewUrl = file instanceof File ? URL.createObjectURL(file) : fileInfo.path;
      if (fileInfo.format === 'video') {
        return {
          type: 'video',
          width: 1280,
          height: 720,
          autoPlay: true,
          sources: [{ src: previewUrl }],
        } as SlideVideo;
      }
      return {
        title: fileInfo.name,
        type: 'image',
        src: previewUrl,
      } as SlideImage;
    });
    return imageSliders;
  }, [files]);

  const lightbox = useLightbox(slides);
  const { setSelected } = lightbox;

  const handlePreview = useCallback(
    (file: any, index: number) => {
      const fileInfo = getFileMeta(file);
      const canPreivew = ([...FILE_FORMATS.image, ...FILE_FORMATS.video] as string[]).includes(
        getFileExtension(fileInfo.path)
      );
      if (!canPreivew) {
        window.open(fileInfo.path, '_blank');
        return;
      }
      setSelected(index);
    },
    [setSelected]
  );

  const renderList = () =>
    filesPreview.map(({ file, previewUrl }, index) => {
      const fileMeta = getFileMeta(file);

      const commonProps: FileThumbnailProps = {
        file,
        previewUrl,
        ...thumbnailProps,
      };

      if (orientation === 'horizontal') {
        return (
          <PreviewItem key={fileMeta.key} orientation="horizontal">
            <FileThumbnail
              tooltip
              showImage
              onPreview={() => {
                handlePreview(file, index);
              }}
              onRemove={onRemove ? () => onRemove(file) : undefined}
              {...commonProps}
              sx={[
                (theme) => ({
                  width: 80,
                  height: 80,
                  border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
                }),
                ...(Array.isArray(thumbnailProps?.sx)
                  ? thumbnailProps?.sx || []
                  : [thumbnailProps?.sx]),
              ]}
              slotProps={{
                icon: { sx: { width: 36, height: 36 } },
                ...thumbnailProps?.slotProps,
              }}
            />
          </PreviewItem>
        );
      }

      return (
        <PreviewItem key={fileMeta.key} orientation="vertical">
          <FileThumbnail {...commonProps} />

          <ListItemText
            primary={fileMeta.name}
            secondary={fileMeta.size ? fData(fileMeta.size) : ''}
            slotProps={{
              secondary: { sx: { typography: 'caption' } },
            }}
          />

          {onRemove && (
            <IconButton size="small" onClick={() => onRemove(file)}>
              <Iconify width={16} icon="mingcute:close-line" />
            </IconButton>
          )}
        </PreviewItem>
      );
    });

  return (
    <PreviewList
      orientation={orientation}
      className={mergeClasses([uploadClasses.preview.multi, className])}
      sx={sx}
      {...other}
    >
      {startNode && <SlotNode orientation={orientation}>{startNode}</SlotNode>}
      {renderList()}
      {endNode && <SlotNode orientation={orientation}>{endNode}</SlotNode>}

      <Lightbox
        open={lightbox.open}
        close={lightbox.onClose}
        slides={slides}
        index={lightbox.selected}
        disableZoom={false}
      />
    </PreviewList>
  );
}

// ----------------------------------------------------------------------

export const PreviewList = styled('ul', {
  shouldForwardProp: (prop: string) => !['orientation', 'sx'].includes(prop),
})<{ orientation?: PreviewOrientation }>(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  variants: [
    {
      props: (props) => props.orientation === 'horizontal',
      style: {
        flexWrap: 'wrap',
        flexDirection: 'row',
      },
    },
  ],
}));

const PreviewItem = styled('li', {
  shouldForwardProp: (prop: string) => !['orientation', 'sx'].includes(prop),
})<{ orientation?: PreviewOrientation }>({
  display: 'inline-flex',
  variants: [
    {
      props: (props) => props.orientation === 'vertical',
      style: ({ theme }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1.5),
        padding: theme.spacing(1, 1, 1, 1.5),
        borderRadius: theme.shape.borderRadius,
        border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
      }),
    },
  ],
});

const SlotNode = styled('li', {
  shouldForwardProp: (prop: string) => !['orientation', 'sx'].includes(prop),
})<{ orientation?: PreviewOrientation }>({
  variants: [
    {
      props: (props) => props.orientation === 'horizontal',
      style: {
        width: 'auto',
        display: 'inline-flex',
      },
    },
  ],
});
