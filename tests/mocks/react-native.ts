export const View = (props: any) => props?.children ?? null;
export const Text = (props: any) => props?.children ?? null;
export const TouchableOpacity = (props: any) => props?.children ?? null;
export const Modal = (props: any) => (props?.visible ? props?.children : null);
export const FlatList = (props: any) => {
  if (!props.data || props.data.length === 0) {
    return props.ListEmptyComponent ?? null;
  }
  return props.data.map((item: any, index: number) =>
    props.renderItem ? props.renderItem({ item, index }) : null
  );
};
export const ScrollView = (props: any) => props?.children ?? null;
export const StyleSheet = {
  create: (styles: any) => styles,
};

export default {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ScrollView,
  StyleSheet,
};
