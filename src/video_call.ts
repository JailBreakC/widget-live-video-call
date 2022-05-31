import AgoraRTC from 'agora-rtc-sdk-ng';
/*
 *  These procedures use Agora Video Call SDK for Web to enable local and remote
 *  users to join and leave a Video Call channel managed by Agora Platform.
 */

/*
 *  Create an {@link https://docs.agora.io/en/Video/API%20Reference/web_ng/interfaces/iagorartcclient.html|AgoraRTCClient} instance.
 *
 * @param {string} mode - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/clientconfig.html#mode| streaming algorithm} used by Agora SDK.
 * @param  {string} codec - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/clientconfig.html#codec| client codec} used by the browser.
 */
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

/*
 * Clear the video and audio tracks used by `client` on initiation.
 */
const localTracks: any = {
  videoTrack: null,
  audioTrack: null
};

/*
 * On initiation no users are connected.
 */
const remoteUsers = {};


AgoraRTC.onAutoplayFailed = () => {
  alert("click to start autoplay!")
}

AgoraRTC.onMicrophoneChanged = async (changedDevice) => {
  // When plugging in a device, switch to a device that is newly plugged in.
  if (changedDevice.state === "ACTIVE") {
    localTracks.audioTrack.setDevice(changedDevice.device.deviceId);
    // Switch to an existing device when the current device is unplugged.
  } else if (changedDevice.device.label === localTracks.audioTrack.getTrackLabel()) {
    const oldMicrophones = await AgoraRTC.getMicrophones();
    oldMicrophones[0] && localTracks.audioTrack.setDevice(oldMicrophones[0].deviceId);
  }
}

AgoraRTC.onCameraChanged = async (changedDevice) => {
  // When plugging in a device, switch to a device that is newly plugged in.
  if (changedDevice.state === "ACTIVE") {
    localTracks.videoTrack.setDevice(changedDevice.device.deviceId);
    // Switch to an existing device when the current device is unplugged.
  } else if (changedDevice.device.label === localTracks.videoTrack.getTrackLabel()) {
    const oldCameras = await AgoraRTC.getCameras();
    oldCameras[0] && localTracks.videoTrack.setDevice(oldCameras[0].deviceId);
  }
}

/*
 * When a user clicks Join or Leave in the HTML form, this procedure gathers the information
 * entered in the form and calls join asynchronously. The UI is updated to match the options entered
 * by the user.
 */
$("#join-form").submit(async function (e) {
  e.preventDefault();
  $("#join").attr("disabled", true);
  try {
    options.appid = $("#appid").val();
    options.token = $("#token").val();
    options.channel = $("#channel").val();
    options.uid = Number($("#uid").val());
    await join();
    if(options.token) {
      $("#success-alert-with-token").css("display", "block");
    } else {
      $("#success-alert a").attr("href", `index.html?appid=${options.appid}&channel=${options.channel}&token=${options.token}`);
      $("#success-alert").css("display", "block");
    }
  } catch (error) {
    console.error(error);
  } finally {
    $("#leave").attr("disabled", false);
  }
})

/*
 * Called when a user clicks Leave in order to exit a channel.
 */
$("#leave").click(function (e) {
  leave();
})

/*
 * Join a channel, then create local video and audio tracks and publish them to the channel.
 */
export async function join(options: { uid: string | number | undefined, appid: string, channel: string, token: string}) {

  // Add an event listener to play remote tracks when remote user publishes.
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  // Join a channel and create local tracks. Best practice is to use Promise.all and run them concurrently.
  const [ uid, audioTrack, videoTrack ] = await Promise.all([
    // Join the channel.
    client.join(options.appid, options.channel, options.token || null, options.uid || null),
    // Create tracks to the local microphone and camera.
    AgoraRTC.createMicrophoneAudioTrack(),
    AgoraRTC.createCameraVideoTrack()
  ]);

  // Play the local video track to the local browser and update the UI with the user ID.
  videoTrack.play("local-player");
  

  // Publish the local video and audio tracks to the channel.
  await client.publish([audioTrack, videoTrack]);
  console.log("publish success");
  return {
    localPlayerName: uid,
    tracks: [audioTrack, videoTrack],
    async leave() {
      audioTrack.stop();
      audioTrack.close();
      videoTrack.stop();
      videoTrack.close();
      await client.leave();
    }
  }
}


/*
 * Add the local use to a remote channel.
 *
 * @param  {IAgoraRTCRemoteUser} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to add.
 * @param {trackMediaType - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/itrack.html#trackmediatype | media type} to add.
 */
async function subscribe(user, mediaType) {
  const uid = user.uid;
  // subscribe to a remote user
  await client.subscribe(user, mediaType);
  console.log("subscribe success");
  if (mediaType === 'video') {
    const player = $(`
      <div id="player-wrapper-${uid}">
        <p class="player-name">remoteUser(${uid})</p>
        <div id="player-${uid}" class="player"></div>
      </div>
    `);
    $("#remote-playerlist").append(player);
    user.videoTrack.play(`player-${uid}`);
  }
  if (mediaType === 'audio') {
    user.audioTrack.play();
  }
}

/*
 * Add a user who has subscribed to the live channel to the local interface.
 *
 * @param  {IAgoraRTCRemoteUser} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to add.
 * @param {trackMediaType - The {@link https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/itrack.html#trackmediatype | media type} to add.
 */
function handleUserPublished(user, mediaType) {
  const id = user.uid;
  remoteUsers[id] = user;
  subscribe(user, mediaType);
}

/*
 * Remove the user specified from the channel in the local interface.
 *
 * @param  {string} user - The {@link  https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html| remote user} to remove.
 */
function handleUserUnpublished(user, mediaType) {
  if (mediaType === 'video') {
    const id = user.uid;
    delete remoteUsers[id];
    $(`#player-wrapper-${id}`).remove();

  }
}
