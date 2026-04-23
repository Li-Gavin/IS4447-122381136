// This checks that the Text component renders the expected content.
import React from 'react';
import { Text } from 'react-native';
import { create, act } from 'react-test-renderer';

describe('IndexScreen', () => {
  it('renders expected content', () => {
    let component;

    act(() => {
      component = create(
        <Text>Hello</Text>
      );
    });

    const textInstance = component.root.findByType(Text);

    // check actual content
    expect(textInstance.props.children).toBe('Hello');
  });
});