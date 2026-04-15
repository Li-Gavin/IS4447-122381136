import { View, Text, TextInput } from 'react-native';

export default function FormField({
  label,
  placeholder,
  value,
  onChangeText,
}: any) {
  return (
    <View>
      <Text>{label}</Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}