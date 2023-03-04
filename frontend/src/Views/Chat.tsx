import { Box, Button, Link, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import youtube from "~/assets/youtube.png";
import tiktok from "~/assets/tiktok.png";
import twitch from "~/assets/twitch.png";

import Logo from "~/assets/logo";

type message = {
  message: string;
  sender: string;
  source: string;
};

const socket = io(import.meta.env.VITE_SOCKET_URL as string);

function Chat() {
  const [messages, setMessages] = useState<message[]>([]);
  const [channels, setChannels] = useState<Record<string, string>>({
    tiktok: "",
    twitch: "",
    youtube: "",
  });
  const [connectPressed, setConnectPressed] = useState<boolean>(false);

  useEffect(() => {
    const channelsString = localStorage.getItem("channels");

    if (channelsString) {
      const channels = JSON.parse(channelsString);

      setChannels(channels);
    }

    socket.on("chat", (data: any) => {
      console.log(data);
      setMessages((messages) => {
        if (messages.length < 6) {
          return [...messages, data];
        } else {
          return [...messages.slice(1), data];
        }
      });
    });

    return () => {
      socket.off("chat");
    };
  }, []);

  const connectBot = async () => {
    localStorage.setItem("channels", JSON.stringify(channels));

    try {
      socket.emit("register", channels);
      setConnectPressed(true);
    } catch (error) {
      console.log(error);
    }
  };

  const renderSwitch = (param: string) => {
    switch (param) {
      case "tiktok":
        return <img src={tiktok} style={{ width: 20, height: 20 }} />;
      case "twitch":
        return <img src={twitch} style={{ width: 20, height: 20 }} />;
      case "youtube":
        return <img src={youtube} style={{ width: 20, height: 20 }} />;
      default:
        return <img src={tiktok} style={{ width: 20, height: 20 }} />;
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#26262A",
        padding: "2rem",
        borderRadius: "0.5rem",
        height: "100%",
        display: "flex",
      }}
    >
      {!connectPressed ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Box display={"flex"} justifyContent="center">
            <Logo />
          </Box>
          <Box textAlign={"start"} margin="0 0 2rem 0">
            <Typography variant="h5">Enter your channel names</Typography>
            <Typography variant="body2">
              Please enter at least one channel name/id
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              margin: "1rem 0",
            }}
          >
            <Box
              sx={{
                display: "flex",
                width: "100%",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "0.5rem",
              }}
            >
              <TextField
                label="TikTok channel name"
                value={channels.tiktok}
                InputLabelProps={{ shrink: true }}
                placeholder="tiktok"
                fullWidth
                onChange={(e) =>
                  setChannels((prev) => ({ ...prev, tiktok: e.target.value }))
                }
              />
              <Typography variant="body2">
                For the URL https://www.tiktok.com/@tiktok the channel ID is
                tiktok
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                width: "100%",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "0.5rem",
              }}
            >
              <TextField
                label="Twitch channel name"
                value={channels.twitch}
                placeholder="twitch"
                InputLabelProps={{ shrink: true }}
                fullWidth
                onChange={(e) =>
                  setChannels((prev) => ({ ...prev, twitch: e.target.value }))
                }
              />
              <Typography variant="body2">
                For the URL https://www.twitch.tv/twitch the channel ID is
                twitch
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "0.5rem",
              }}
            >
              <TextField
                label="Youtube channel ID"
                value={channels.youtube}
                placeholder="UlvG2-lrZTJD3DELBsJo9flO"
                InputLabelProps={{ shrink: true }}
                fullWidth
                onChange={(e) =>
                  setChannels((prev) => ({ ...prev, youtube: e.target.value }))
                }
              />
              <Typography variant="body2">
                Youtube channel ID can be found from
                <Link
                  sx={{ margin: "0 0 0 0.5rem" }}
                  target="_blank"
                  href="https://www.youtube.com/account_advanced"
                >
                  here
                </Link>
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            fullWidth
            onClick={connectBot}
            sx={{
              margin: "auto 0 0 0",
            }}
            disabled={Object.keys(channels).every(
              (key: string) => !channels[key]
            )}
          >
            Start the screen
          </Button>
        </Box>
      ) : (
        <Box>
          <Logo />
          {messages.map((message, index) => {
            return (
              <Box key={index + message.sender + message.message}>
                <Box
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.25rem",
                  }}
                >
                  {renderSwitch(message.source)}
                  <Typography variant="body2">
                    <Typography
                      variant="body2"
                      component="span"
                      style={{
                        fontWeight: "bold",
                        color: message.source === "tiktok" ? "green" : "blue",
                      }}
                    >
                      {message.sender}
                    </Typography>
                    <Typography
                      variant="body2"
                      component="span"
                      style={{
                        marginLeft: 5,
                      }}
                    >
                      {message.message}
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

export default Chat;
