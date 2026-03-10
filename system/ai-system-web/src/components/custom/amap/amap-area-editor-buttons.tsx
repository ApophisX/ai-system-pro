import { Stack, Button, styled } from '@mui/material';

const MapEditorContainer = styled(Stack)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  gap: theme.spacing(2),
  paddingBlock: theme.spacing(1),
  paddingInline: theme.spacing(2),
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 1,
}));

type Props = {
  editing: boolean;
  curTarget: any;
  onStart: () => void;
  onStop: () => void;
  onDelete: () => void;
};
export function AmapAreaEditorButtons({ editing, curTarget, onStart, onStop, onDelete }: Props) {
  return (
    <MapEditorContainer>
      {editing ? (
        <Button variant="contained" onClick={onStop} color="secondary">
          结束编辑
        </Button>
      ) : (
        <Button variant="contained" onClick={onStart} color="primary">
          开始编辑
        </Button>
      )}

      <Button variant="contained" color="error" onClick={onDelete} disabled={!curTarget}>
        删除区域
      </Button>
    </MapEditorContainer>
  );
}
