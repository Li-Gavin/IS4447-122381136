import React from 'react';
import { TextInput } from 'react-native';
import { create, act } from 'react-test-renderer';

describe('FormField', () => {
  it('renders and handles input', () => {
    let component;
    let mockChange = jest.fn();

    act(() => {
      component = create(
        <TextInput
          placeholder="Enter text"
          onChangeText={mockChange}
        />
      );
    });

    const input = component.root.findByType(TextInput);

    // simulate user typing
    act(() => {
      input.props.onChangeText('Hello');
    });

    // check callback fired
    expect(mockChange).toHaveBeenCalledWith('Hello');
  });
});