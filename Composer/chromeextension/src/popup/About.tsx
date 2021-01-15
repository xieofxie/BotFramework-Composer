import React from 'react';

const Links = [
  ['Source Code', 'https://github.com/xieofxie/BotFramework-Composer/tree/hualxie/extension/Composer/chromeextension'],
];

const About: React.FC = () => {
  return (
    <>
      {Links.map((link, index) => {
        return (
          <p key={index}>
            <a href={link[1]} target="_blank" rel="noopener noreferrer">
              {link[0]}
            </a>
          </p>
        );
      })}
    </>
  );
};

export default About;
