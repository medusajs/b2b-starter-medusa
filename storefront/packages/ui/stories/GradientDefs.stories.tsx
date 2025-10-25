import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { GradientDefs } from '../src/components/GradientDefs';

export default {
  title: 'Design System/GradientDefs',
  component: GradientDefs
} as Meta<typeof GradientDefs>;

const Template: StoryFn = () => (
  <div className="p-8 space-y-8">
    <GradientDefs />
    
    <div>
      <h3 className="text-lg font-bold mb-4">Linear Gradient Stroke</h3>
      <svg width="200" height="200" className="stroke-gradient-ysh">
        <circle cx="100" cy="100" r="80" strokeWidth="8" fill="none" />
      </svg>
    </div>
    
    <div>
      <h3 className="text-lg font-bold mb-4">Radial Gradient Stroke</h3>
      <svg width="200" height="200" className="stroke-gradient-ysh-radial">
        <circle cx="100" cy="100" r="80" strokeWidth="8" fill="none" />
      </svg>
    </div>
    
    <div>
      <h3 className="text-lg font-bold mb-4">Sunburst Pattern (Logo Style)</h3>
      <svg width="200" height="200">
        <g>
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i * 360) / 16;
            return (
              <line
                key={i}
                x1="100"
                y1="100"
                x2={100 + Math.cos((angle * Math.PI) / 180) * 90}
                y2={100 + Math.sin((angle * Math.PI) / 180) * 90}
                stroke="url(#ysh-gradient-sunburst)"
                strokeWidth="12"
                strokeLinecap="round"
              />
            );
          })}
          <circle cx="100" cy="100" r="30" fill="white" />
        </g>
      </svg>
    </div>
    
    <div>
      <h3 className="text-lg font-bold mb-4">Icon with Gradient Stroke</h3>
      <svg width="100" height="100" viewBox="0 0 24 24" className="stroke-gradient-ysh">
        <path 
          d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" 
          strokeWidth="2" 
          fill="none"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  </div>
);

export const Default = Template.bind({});
