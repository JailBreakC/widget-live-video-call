import React from 'react';
import { initializeWidget } from '@vikadata/widget-sdk';
import { Setting } from './setting';
import { TextInput } from '@vikadata/components';
import './index.css';

export const HelloWorld: React.FC = () => {
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flexGrow: 1, overflow: 'auto', padding: '0 8px'}}>
        <div>
          <div className="col-sm">
            <p className="join-info-text">APP ID</p>
              <TextInput id="appid" type="text" placeholder="Enter the appid" required />
            <p className="tips">You find your APP ID in the <a href="https://console.agora.io/projects">Agora Console</a></p>
          </div>
          <div className="col-sm">
            <p className="join-info-text">Token(optional)</p>
              <TextInput id="token" type="text" placeholder="Enter the app token" />
            <p className="tips">To create a temporary token, <a href="https://console.agora.io/projects">edit your project</a> in Agora Console.</p>
          </div>
          <div className="col-sm">
            <p className="join-info-text">Channel Name</p>
            <TextInput id="channel" type="text" placeholder="Enter the channel name" required />
            <p className="tips">You create a channel when you create a temporary token. You guessed it, in <a href="https://console.agora.io/projects">Agora Console</a></p>
          </div>
          <div className="col-sm">
            <p className="join-info-text">User ID(optional)</p>
            <TextInput id="uid" type="text" placeholder="Enter the user ID" />
          </div>
        </div>
        <div className="button-group">
          <button id="join" type="submit" className="btn btn-primary btn-sm">Join</button>
          <button id="leave" type="button" className="btn btn-primary btn-sm" disabled>Leave</button>
        </div>
      </div>
      <Setting />
    </div>
  );
};

initializeWidget(HelloWorld, process.env.WIDGET_PACKAGE_ID);
