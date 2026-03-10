import type { UploadProps } from '../types';
import type { MultiFilePreviewProps } from '../components/multi-file-preview';

import { useDropzone } from 'react-dropzone';
import { varAlpha, mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Stack, Typography } from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';

import { UploadIllustration } from 'src/assets/illustrations';

import { Iconify } from '../../iconify';
import { uploadClasses } from '../classes';
import { RejectedFiles } from '../components/rejected-files';
import { MultiFilePreview } from '../components/multi-file-preview';
import { SingleFilePreview } from '../components/single-file-preview';
import { UploadArea, DeleteButton, UploadWrapper, PlaceholderContainer } from './styles';

// ----------------------------------------------------------------------

export function Upload({
  sx,
  value,
  error,
  disabled,
  onDelete,
  onUpload,
  onRemove,
  className,
  helperText,
  onRemoveAll,
  slotProps,
  loading = false,
  multiple = false,
  hideFilesRejected = false,
  previewOrientation = 'horizontal',
  maxFiles = 9,
  maxSize,
  miniMode = true,
  onUploadChange,
  ...dropzoneOptions
}: UploadProps & { miniMode?: boolean }) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    multiple,
    disabled,
    maxFiles,
    maxSize,
    ...dropzoneOptions,
  });

  const isSingleFileSelected = !multiple && !!value && !Array.isArray(value);
  const hasMultiFilesSelected = multiple && Array.isArray(value) && value.length > 0;
  const hasError = isDragReject || !!error;
  const showFilesRejected = !hideFilesRejected && fileRejections.length > 0;

  const renderPlaceholder = () =>
    dropzoneOptions.placeholder ? (
      dropzoneOptions.placeholder
    ) : (
      <PlaceholderContainer className={uploadClasses.placeholder.root}>
        <UploadIllustration hideBackground sx={{ width: 200 }} />
        <div className={uploadClasses.placeholder.content}>
          <div className={uploadClasses.placeholder.title}>
            {/* {multiple ? 'Drop or select files' : 'Drop or select a file'} */}
            拖拽或选择文件
          </div>
          <div className={uploadClasses.placeholder.description}>
            {/* {multiple ? 'Drag files here' : 'Drag a file here'},  */}
            拖拽文件 或者 <span>浏览</span> 本地文件.
          </div>
        </div>
      </PlaceholderContainer>
    );

  const renderMiniPlaceholder = () => {
    const hasMoreFiles = Array.isArray(value) && value.length < maxFiles && !disabled;
    const uploadElement = (
      <Box
        {...getRootProps()}
        component="span"
        sx={{
          width: 80,
          height: 80,
          cursor: 'pointer',
          border: (theme) => `dashed 1px ${hasError ? theme.vars.palette.error.main : varAlpha(theme.vars.palette.grey['500Channel'], 0.3)}`,
          borderRadius: 1.25,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Iconify icon="eva:cloud-upload-fill" sx={{ width: 30, height: 30 }} />
        <Typography variant="caption" sx={{ mt: 0.5 }}>
          上传
        </Typography>
        <input {...getInputProps()} />
      </Box>
    );
    return (
      <Stack direction="row" alignItems="center" gap={1}>
        {renderMultiFilesPreview({
          endNode: hasMoreFiles ? uploadElement : undefined,
        })}
        {hasMoreFiles && !value.length ? uploadElement : null}
      </Stack>
    );
  };

  const renderSingleFileLoading = () =>
    loading &&
    !multiple && (
      <CircularProgress
        size={32}
        color="primary"
        sx={{
          zIndex: 9,
          left: '50%',
          top: '50%',
          marginTop: '-16px',
          marginLeft: '-16px',
          position: 'absolute',
        }}
      />
    );

  const renderSingleFilePreview = () => isSingleFileSelected && <SingleFilePreview file={value} />;

  const renderMultiFilesPreview = (params?: Partial<MultiFilePreviewProps>) =>
    hasMultiFilesSelected && (
      <>
        <MultiFilePreview
          files={value}
          onRemove={disabled ? undefined : onRemove}
          orientation={previewOrientation}
          {...params}
          {...slotProps?.multiPreview}
        />

        {(onRemoveAll || onUpload) && (
          <Box sx={{ gap: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
            {onRemoveAll && (
              <Button size="small" variant="outlined" color="inherit" onClick={onRemoveAll}>
                Remove All
              </Button>
            )}
            {onUpload && (
              <Button
                size="small"
                variant="contained"
                onClick={onUpload}
                startIcon={<Iconify icon="eva:cloud-upload-fill" />}
                loading={loading && multiple}
                loadingPosition="start"
              >
                {loading && multiple ? 'Uploading...' : 'Upload'}
              </Button>
            )}
          </Box>
        )}
      </>
    );

  if (miniMode && multiple) {
    return (
      <UploadWrapper>
        <Box
          className={mergeClasses([uploadClasses.default, className], {
            [uploadClasses.state.dragActive]: isDragActive,
            [uploadClasses.state.disabled]: disabled,
            [uploadClasses.state.error]: hasError,
          })}
          sx={sx}
        >
          {renderMiniPlaceholder()}
        </Box>

        {helperText && <FormHelperText error={!!error}>{helperText}</FormHelperText>}
        {showFilesRejected && (
          <RejectedFiles files={fileRejections} {...slotProps?.rejectedFiles} maxSize={maxSize} />
        )}
      </UploadWrapper>
    );
  }

  const inputProps = getInputProps();
  return (
    <UploadWrapper {...slotProps?.wrapper} className={uploadClasses.wrapper}>
      <UploadArea
        {...getRootProps()}
        className={mergeClasses([uploadClasses.default, className], {
          [uploadClasses.state.dragActive]: isDragActive,
          [uploadClasses.state.disabled]: disabled,
          [uploadClasses.state.error]: hasError,
        })}
        sx={sx}
      >
        <input
          {...inputProps}
          onChange={(e) => {
            inputProps?.onChange?.(e);
            onUploadChange?.(e.target.files?.[0] ?? '');
          }}
        />
        {isSingleFileSelected ? renderSingleFilePreview() : renderPlaceholder()}
        {renderSingleFileLoading()}
      </UploadArea>

      {isSingleFileSelected && !disabled && (
        <DeleteButton size="small" onClick={onDelete}>
          <Iconify icon="mingcute:close-line" width={16} />
        </DeleteButton>
      )}

      {helperText && <FormHelperText error={!!error}>{helperText}</FormHelperText>}
      {showFilesRejected && <RejectedFiles files={fileRejections} {...slotProps?.rejectedFiles} />}

      {renderMultiFilesPreview()}
    </UploadWrapper>
  );
}
