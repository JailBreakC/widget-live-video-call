import React, { useState } from 'react';
import { initializeWidget } from '@vikadata/widget-sdk';
import { Setting } from './setting';
import { Button, ButtonGroup, TextInput, useToggle } from '@vikadata/components';
import './index.css';

export const HelloWorld: React.FC = () => {
  const [appid, setAppid] = useState<string>();
  const [channel, setChannel] = useState<string>();
  const [uid, setUid] = useState<string>();
  const [token, setToken] = useState<string>();
  const [joined, {toggle: toggleJoined }] = useToggle(false);

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flexGrow: 1, overflow: 'auto', padding: '0 8px'}}>
        <div className="row" style={{ display: 'flex', flexWrap: 'wrap' }}>
          <div className="col-sm">
            <p className="join-info-text">APP ID</p>
              <TextInput id="appid" type="text" placeholder="Enter the appid" required onChange={(v) => setAppid(v.target.value)}/>
            <p className="tips">You find your APP ID in the <a href="https://console.agora.io/projects">Agora Console</a></p>
          </div>
          <div className="col-sm">
            <p className="join-info-text">Token(optional)</p>
              <TextInput id="token" type="text" placeholder="Enter the app token" onChange={(v) => setToken(v.target.value)} />
            <p className="tips">To create a temporary token, <a href="https://console.agora.io/projects">edit your project</a> in Agora Console.</p>
          </div>
          <div className="col-sm">
            <p className="join-info-text">Channel Name</p>
            <TextInput id="channel" type="text" placeholder="Enter the channel name" required onChange={(v) => setChannel(v.target.value)}/>
            <p className="tips">You create a channel when you create a temporary token.<br /> You guessed it, in <a href="https://console.agora.io/projects">Agora Console</a></p>
          </div>
          <div className="col-sm">
            <p className="join-info-text">User ID(optional)</p>
            <TextInput id="uid" type="text" placeholder="Enter the user ID" onChange={(v) => setUid(v.target.value)}/>
          </div>
        </div>
        <ButtonGroup className="button-group">
          <Button id="join" onClick={() => toggleJoined()} disabled={joined}>Join</Button>
          <Button id="leave" type="button" disabled={!joined}>Leave</Button>
        </ButtonGroup>
      </div>
      <Setting />
    </div>
  );
};

initializeWidget(HelloWorld, process.env.WIDGET_PACKAGE_ID);
