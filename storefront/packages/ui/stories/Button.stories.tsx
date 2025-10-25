import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import Button, { ButtonProps } from '../src/components/Button';

export default {
    title: 'Components/Button',
    component: Button
} as Meta<typeof Button>;

const Template: StoryFn<ButtonProps> = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
    children: 'Primary Button',
    variant: 'primary'
};

export const Secondary = Template.bind({});
Secondary.args = {
    children: 'Secondary',
    variant: 'secondary'
};
