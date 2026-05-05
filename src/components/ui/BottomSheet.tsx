import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { ReactNode } from 'react';
import { theme } from '../../theme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const BottomSheet = ({ visible, onClose, children }: BottomSheetProps) => {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, theme.shadows.level2]} onPress={() => undefined}>
          <View style={styles.handle} />
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.surface.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface.raised,
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.border.strong,
    alignSelf: 'center',
  },
});
