const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { Client, MessageMedia ,LegacySessionAuth} = require('whatsapp-web.js');
const SESSION_FILE_PATH = './session.json';
const mime = require('mime-types');
const rmeme = require('rmeme');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000
const path = require('path');
const weather = require('./modules/weather');
const fetch  = require('node-fetch');


app.get('/',function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));

    let sessionData;
    if (fs.existsSync(SESSION_FILE_PATH)) {
        sessionData = require(SESSION_FILE_PATH);
    }
    
    
    const client = new Client({
        puppeteer: { args: ["--no-sandbox"] },
        ffmpeg:'./ffmpeg',
        session: sessionData
    }); 

   
    client.on('authenticated', (session) => {
        sessionData = session;
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
            if (err) {
                console.error(err);
            }
        });
    });
    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
    });
    client.on('message', message => {
        console.log(message.body);
    });
    
    client.on('message', async message => {
        let chat = await message.getChat();
        //console.log(chat);
        chat.sendSeen();

        if (message.body === '-ping') {
            message.reply('pong');
            console.log(message);
        }else if (message.body === '-meme') {
            const ImageUrl = await rmeme.meme()
            console.log(ImageUrl);
            const memeImg = await MessageMedia.fromUrl(ImageUrl);
            client.sendMessage(message.from, message.reply(await memeImg))
        }else if (message.body === '-delete') {
                if (message.hasQuotedMsg) {
                    const quotedMsg = await message.getQuotedMessage();
                    if (quotedMsg.fromMe) {
                        quotedMsg.delete(true);
                    } else {
                        message.reply('I can only delete my own messages');
                    }
                }
            }else if (message.body === '-groupinfo') {
                let chat = await message.getChat();
                if (chat.isGroup) {
                    message.reply(`
*Group Details*
Name: ${chat.name}
Description: ${chat.description}
Created At: ${chat.createdAt.toString()}
Created By: ${chat.owner.user}
Participant count: ${chat.participants.length}
                    `);
                } else {
                    message.reply('This command can only be used in a group!');
                }
            }else if (message.body === '-info') {
                let info = client.info;
                client.sendMessage(message.from, `
*Connection info*
User name: ${info.pushname}
My number: ${info.me.user}
Platform: ${info.platform}
WhatsApp version: ${info.phone.wa_version}
                `);
            }else if(message.body.startsWith("-weather ")){
                message.delete(true)
                var data = await weather.mainF(message.body.replace("-weather ", ""));
                if (data == "error") {
                    console.log(`error`)
                    client.sendMessage(message.from, `🙇‍♂️ *Error*\n\n` + "```Something Unexpected Happened to fetch Weather```")
                } else {
                    client.sendMessage(message.from, 
`*Today's Weather at ${data.place}*
*Temperature is* ${data.temperature}°C\n
*Date :* ${data.date}
*Day :* ${data.day}
*Time :* ${data.time}`                        
                        );
                }
            }else if(chat.isGroup){
                
            let grpid = chat.id._serialized;
            console.log("Group ID: " + grpid);

             if(message.body === '-sticker'){
                if(message.hasMedia){
                    message.downloadMedia().then(media => {
    
                        if (media) {
            
                            const mediaPath = './downloaded-media/';
            
                            if (!fs.existsSync(mediaPath)) {
                                fs.mkdirSync(mediaPath);
                            }
            
            
                            const extension = mime.extension(media.mimetype);
            
                            const filename = new Date().getTime();
            
                            const fullFilename = mediaPath + filename + '.' + extension;
            
                            // Save to file
                            try {
                                fs.writeFileSync(fullFilename, media.data, { encoding: 'base64' });
                                console.log('File downloaded successfully!', fullFilename);
                                console.log(fullFilename);
                                MessageMedia.fromFilePath(filePath = fullFilename)
                                client.sendMessage(message.from, new MessageMedia(media.mimetype, media.data, filename), { sendMediaAsSticker: true,stickerAuthor:"Created By Bot",stickerName:"Stickers"} )
                                fs.unlinkSync(fullFilename)
                                console.log(`File Deleted successfully!`,);
                            } catch (err) {
                                console.log('Failed to save the file:', err);
                                console.log(`File Deleted successfully!`,);
                            }
                        }
                    });
                }else{
                    message.reply(`send image with caption *-sticker* `)
                }
    
             }
             else if (message.body === '-help') {
                message.reply(
    `╭━〔 INRL-BOT-MD 〕━◉
┃╭━━━━━━━━━━━━━━◉
┃┃ Plugins : 124
┃┃ User :- @⁨~៚⋰𝗦𝙞𝙩𝙝𝙪𝙢 𝗘𝙨𝙝𝙖𝙣꧂͒ຮ⁩
┃┃ Owner : INRL
┃┃ Version: 4.1.0
┃┃ Prefix:- .
┃┃ MOD :- private
┃┃ Date :- September 17, 2023
┃┃ Time :- 6:02:19 PM
┃╰━━━━━━━━━━━━━◉
┠┌─⭓『     *INFO*     』
┃│◦ ʟɪsᴛ
┃│◦ ᴀʟɪᴠᴇ
┃│◦ ᴛᴏsʜᴏᴡʟɪsᴛᴏғᴄᴍᴅs
┃│◦ ғɪʟᴛᴇʀ
┃│◦ ᴄᴀʟᴄ
┃│◦ ᴀɢᴇ
┃│◦ ᴘɪɴɢ
┃└──────────⭓
┠┌─⭓『   *WHATSAPP*   』
┃│◦ ᴍᴇɴᴜ
┃│◦ ᴅᴇʟ
┃│◦ ᴅʟᴛ
┃└──────────⭓
┠┌─⭓『     *MISC*     』
┃│◦ ᴛᴛᴘ
┃│◦ ᴀᴛᴛᴘ
┃│◦ ᴡᴇʙss
┃│◦ ᴛᴏɢɢʟᴇ
┃└──────────⭓
┠┌─⭓『    *OTHERS*    』
┃│◦ ᴀᴛᴛᴘ
┃│◦ ᴀᴛᴛᴘ
┃│◦ ᴜᴘᴅᴀᴛᴇ
┃│◦ sʜᴜᴛᴅᴏᴡɴ
┃│◦ ᴘʟᴀʏ
┃│◦ ᴡᴇᴀᴛʜᴇʀ
┃│◦ sᴇᴛᴛɪɴɢ
┃│◦ sᴇᴛᴛɪɴɢ
┃│◦ ᴠɪᴅᴇᴏ
┃└──────────⭓
┠┌─⭓『    *ACTION*    』
┃│◦ sᴇᴛᴄᴍᴅ
┃│◦ ᴅʟᴛᴄᴍᴅ
┃│◦ ɢᴇᴛᴄᴍᴅ
┃│◦ ᴘᴇʀᴍɪᴛ
┃│◦ ᴏᴛᴘ
┃│◦ ʟɪᴍɪᴛ
┃│◦ ᴡᴀʀɴ
┃└──────────⭓
┠┌─⭓『   *CONVERTER*   』
┃│◦ ᴘʜᴏᴛᴏ
┃│◦ ᴠɪᴅᴇᴏ
┃│◦ ᴠᴏɪᴄᴇ
┃│◦ ɢɪғ
┃│◦ ᴍᴘ3
┃│◦ ʀᴍʙɢ
┃│◦ ᴜʀʟ
┃│◦ ᴛɪɴʏᴜʀʟ
┃│◦ ʙᴀsᴇ64ᴇ
┃│◦ ʙᴀsᴇ64ᴅ
┃│◦ sᴛɪᴄᴋᴇʀ
┃│◦ ᴛᴛs
┃└──────────⭓
┠┌─⭓『  *AUDIO-EDIT*  』
┃│◦ ʙᴀss
┃│◦ sʟᴏᴡ
┃│◦ ʙʟᴏᴡɴ
┃│◦ ᴅᴇᴇᴘ
┃│◦ ᴇᴀʀʀᴀᴘᴇ
┃│◦ ғᴀsᴛ
┃│◦ ғᴀᴛ
┃│◦ ɴɪɢʜᴛᴄᴏʀᴇ
┃│◦ ʀᴇᴠᴇʀsᴇ
┃│◦ sǫᴜɪʀʀᴇʟ
┃└──────────⭓
┠┌─⭓『    *SYSTEM*    』
┃│◦ ʀᴇsᴛᴀʀᴛ
┃│◦ ᴘʟᴜɢɪɴ
┃│◦ ʀᴇᴍᴏᴠᴇ
┃│◦ sᴇᴛᴛɪɴɢ
┃└──────────⭓
┠┌─⭓『    *UTILITY*    』
┃│◦ ғᴀɴᴄʏ
┃│◦ ᴛᴀᴋᴇ
┃└──────────⭓
┠┌─⭓『      *EVA*      』
┃│◦ ɢᴘᴛ
┃│◦ ᴏᴄʀ
┃└──────────⭓
┠┌─⭓『     *GROUP*     』
┃│◦ ᴘʀᴏᴍᴏᴛᴇ
┃│◦ ᴅᴇᴍᴏᴛᴇ
┃│◦ ᴋɪᴄᴋ
┃│◦ ᴀᴅᴅ
┃│◦ ɢᴘᴘ
┃│◦ ғᴜʟʟɢᴘᴘ
┃│◦ ɢɴᴀᴍᴇ
┃│◦ ɢᴅᴇsᴄ
┃│◦ ᴍᴜᴛᴇ
┃│◦ ᴜɴᴍᴜᴛᴇ
┃│◦ ʟᴏᴄᴋ
┃│◦ ᴜɴʟᴏᴄᴋ
┃│◦ ʟᴇғᴛ
┃│◦ ɪɴᴠɪᴛᴇ
┃│◦ ʀᴇᴠᴏᴋᴇ
┃│◦ ɢᴇᴛɪɴғᴏ
┃└──────────⭓
┠┌─⭓『     *OWNER*     』
┃│◦ ᴀᴄᴘᴛ
┃│◦ ᴛᴀɢ
┃│◦ ʙʟᴏᴄᴋ
┃│◦ ᴜɴʙʟᴏᴄᴋ
┃│◦ ᴘᴘ
┃│◦ ғᴜʟʟᴘᴘ
┃└──────────⭓
┠┌─⭓『    *MANAGE*    』
┃│◦ ᴀᴍᴜᴛᴇ
┃│◦ ᴀᴜɴᴍᴜᴛᴇ
┃│◦ ᴘᴅᴍ
┃│◦ ᴀɴᴛɪʟɪɴᴋ
┃│◦ ᴀɴᴛɪᴡᴏʀᴅ
┃│◦ ᴀɴᴛɪғᴀᴋᴇ
┃│◦ ᴅᴇʟғᴀᴋᴇ
┃│◦ ᴅᴇʟᴡᴏʀᴅ
┃│◦ ᴅᴇʟᴍᴜᴛᴇ
┃│◦ ᴅᴇʟᴜɴᴍᴜᴛᴇ
┃│◦ ɢᴇᴛғᴀᴋᴇ
┃│◦ ɢᴇᴛᴡᴏʀᴅ
┃│◦ ɢᴇᴛᴍᴜᴛᴇ
┃│◦ ɢᴇᴛᴜɴᴍᴜᴛᴇ
┃└──────────⭓
┠┌─⭓『    *SEARCH*    』
┃│◦ ɪᴍɢ
┃│◦ ʟʏʀɪᴄs
┃│◦ ɢᴏᴏɢʟᴇ
┃│◦ ʀɪɴɢᴛᴏɴᴇ
┃│◦ ᴡᴇᴀᴛʜᴇʀ
┃│◦ ᴛʀᴛ
┃│◦ ᴛʀᴜᴇ
┃│◦ ɪsᴡᴀ
┃│◦ ɴᴏᴡᴀ
┃└──────────⭓
┠┌─⭓『   *DOWNLOAD*   』
┃│◦ ɪɴsᴛᴀ
┃│◦ sᴛᴏʀʏ
┃└──────────⭓
┠┌─⭓『    *CREATE*    』
┃│◦ ᴇᴍɪx
┃│◦ ǫʀ
┃└──────────⭓
┠┌─⭓『  *DOWNLOADER*  』
┃│◦ ᴘʟᴀʏ
┃│◦ sᴏɴɢ
┃│◦ ᴠɪᴅᴇᴏ
┃└──────────⭓
┠┌─⭓『   *DATABASE*   』
┃│◦ ɢᴇᴛᴠᴀʀ
┃└──────────⭓
┠┌─⭓『   *SETTINGS*   』
┃│◦ ᴘʀᴇғɪx
┃│◦ ᴀᴅᴀᴛᴀ
┃│◦ sᴅᴀᴛᴀ
┃│◦ ʙɪᴏ
┃│◦ ʟᴀɴɢ
┃│◦ ᴀɴᴛɪʙᴏᴛ
┃│◦ ʙᴀɴ
┃│◦ ᴜɴʙᴀɴ
┃│◦ ʙɪɴғᴏ
┃│◦ sᴜᴅᴏ
┃└──────────⭓
┠┌─⭓『    *GENERAL*    』
┃│◦ ᴊɪᴅ
┃└──────────⭓
╰━━━━━━━━━━━━━◉`
                )
            }else if(message.body === '-quote'){
                const apiData = await fetch('https://type.fit/api/quotes')
                const JsonData = await apiData.json();
                message.reply(`*${JsonData[ Math.floor(Math.random() * JsonData.length)].text}*`)
            }
        }else if(!chat.isGroup){
            if(message.hasMedia){
                message.downloadMedia().then(media => {

                    if (media) {
        
                        const mediaPath = './downloaded-media/';
        
                        if (!fs.existsSync(mediaPath)) {
                            fs.mkdirSync(mediaPath);
                        }
                        const extension = mime.extension(media.mimetype);
        
                        const filename = new Date().getTime();
        
                        const fullFilename = mediaPath + filename + '.' + extension;
        
                        // Save to file
                        try {
                            fs.writeFileSync(fullFilename, media.data, { encoding: 'base64' });
                            console.log('File downloaded successfully!', fullFilename);
                            console.log(fullFilename);
                            MessageMedia.fromFilePath(filePath = fullFilename)
                            client.sendMessage(message.from, new MessageMedia(media.mimetype, media.data, filename), { sendMediaAsSticker: true,stickerAuthor:"Created By mx-bot",stickerName:"Stickers"} )
                            fs.unlinkSync(fullFilename)
                            console.log(`File Deleted successfully!`,);
                        } catch (err) {
                            console.log('Failed to save the file:', err);
                            console.log(`File Deleted successfully!`,);
                        }
                    }
                })
        }else if(message.body === '-quote'){
            const apiData = await fetch('https://type.fit/api/quotes')
            const JsonData = await apiData.json();
            message.reply(`*${JsonData[ Math.floor(Math.random() * JsonData.length)].text}*`)
        }

        else if (message.body === '-help') {
            message.reply(
`╭━〔 INRL-BOT-MD 〕━◉\n
┃╭━━━━━━━━━━━━━━◉
┃┃ Plugins : 124
┃┃ User :- @⁨~៚⋰𝗦𝙞𝙩𝙝𝙪𝙢 𝗘𝙨𝙝𝙖𝙣꧂͒ຮ⁩
┃┃ Owner : INRL
┃┃ Version: 4.1.0
┃┃ Prefix:- .
┃┃ MOD :- private
┃┃ Date :- September 17, 2023
┃┃ Time :- 6:02:19 PM
┃╰━━━━━━━━━━━━━◉\n
┠┌─⭓『     *INFO*     』
┃│◦ ʟɪsᴛ
┃│◦ ᴀʟɪᴠᴇ
┃│◦ ᴛᴏsʜᴏᴡʟɪsᴛᴏғᴄᴍᴅs
┃│◦ ғɪʟᴛᴇʀ
┃│◦ ᴄᴀʟᴄ
┃│◦ ᴀɢᴇ
┃│◦ ᴘɪɴɢ
┃└──────────⭓
┠┌─⭓『   *WHATSAPP*   』
┃│◦ ᴍᴇɴᴜ
┃│◦ ᴅᴇʟ
┃│◦ ᴅʟᴛ
┃└──────────⭓
┠┌─⭓『     *MISC*     』
┃│◦ ᴛᴛᴘ
┃│◦ ᴀᴛᴛᴘ
┃│◦ ᴡᴇʙss
┃│◦ ᴛᴏɢɢʟᴇ
┃└──────────⭓
┠┌─⭓『    *OTHERS*    』
┃│◦ ᴀᴛᴛᴘ
┃│◦ ᴀᴛᴛᴘ
┃│◦ ᴜᴘᴅᴀᴛᴇ
┃│◦ sʜᴜᴛᴅᴏᴡɴ
┃│◦ ᴘʟᴀʏ
┃│◦ ᴡᴇᴀᴛʜᴇʀ
┃│◦ sᴇᴛᴛɪɴɢ
┃│◦ sᴇᴛᴛɪɴɢ
┃│◦ ᴠɪᴅᴇᴏ
┃└──────────⭓
┠┌─⭓『    *ACTION*    』
┃│◦ sᴇᴛᴄᴍᴅ
┃│◦ ᴅʟᴛᴄᴍᴅ
┃│◦ ɢᴇᴛᴄᴍᴅ
┃│◦ ᴘᴇʀᴍɪᴛ
┃│◦ ᴏᴛᴘ
┃│◦ ʟɪᴍɪᴛ
┃│◦ ᴡᴀʀɴ
┃└──────────⭓
┠┌─⭓『   *CONVERTER*   』
┃│◦ ᴘʜᴏᴛᴏ
┃│◦ ᴠɪᴅᴇᴏ
┃│◦ ᴠᴏɪᴄᴇ
┃│◦ ɢɪғ
┃│◦ ᴍᴘ3
┃│◦ ʀᴍʙɢ
┃│◦ ᴜʀʟ
┃│◦ ᴛɪɴʏᴜʀʟ
┃│◦ ʙᴀsᴇ64ᴇ
┃│◦ ʙᴀsᴇ64ᴅ
┃│◦ sᴛɪᴄᴋᴇʀ
┃│◦ ᴛᴛs
┃└──────────⭓
┠┌─⭓『  *AUDIO-EDIT*  』
┃│◦ ʙᴀss
┃│◦ sʟᴏᴡ
┃│◦ ʙʟᴏᴡɴ
┃│◦ ᴅᴇᴇᴘ
┃│◦ ᴇᴀʀʀᴀᴘᴇ
┃│◦ ғᴀsᴛ
┃│◦ ғᴀᴛ
┃│◦ ɴɪɢʜᴛᴄᴏʀᴇ
┃│◦ ʀᴇᴠᴇʀsᴇ
┃│◦ sǫᴜɪʀʀᴇʟ
┃└──────────⭓
┠┌─⭓『    *SYSTEM*    』
┃│◦ ʀᴇsᴛᴀʀᴛ
┃│◦ ᴘʟᴜɢɪɴ
┃│◦ ʀᴇᴍᴏᴠᴇ
┃│◦ sᴇᴛᴛɪɴɢ
┃└──────────⭓
┠┌─⭓『    *UTILITY*    』
┃│◦ ғᴀɴᴄʏ
┃│◦ ᴛᴀᴋᴇ
┃└──────────⭓
┠┌─⭓『      *EVA*      』
┃│◦ ɢᴘᴛ
┃│◦ ᴏᴄʀ
┃└──────────⭓
┠┌─⭓『     *GROUP*     』
┃│◦ ᴘʀᴏᴍᴏᴛᴇ
┃│◦ ᴅᴇᴍᴏᴛᴇ
┃│◦ ᴋɪᴄᴋ
┃│◦ ᴀᴅᴅ
┃│◦ ɢᴘᴘ
┃│◦ ғᴜʟʟɢᴘᴘ
┃│◦ ɢɴᴀᴍᴇ
┃│◦ ɢᴅᴇsᴄ
┃│◦ ᴍᴜᴛᴇ
┃│◦ ᴜɴᴍᴜᴛᴇ
┃│◦ ʟᴏᴄᴋ
┃│◦ ᴜɴʟᴏᴄᴋ
┃│◦ ʟᴇғᴛ
┃│◦ ɪɴᴠɪᴛᴇ
┃│◦ ʀᴇᴠᴏᴋᴇ
┃│◦ ɢᴇᴛɪɴғᴏ
┃└──────────⭓
┠┌─⭓『     *OWNER*     』
┃│◦ ᴀᴄᴘᴛ
┃│◦ ᴛᴀɢ
┃│◦ ʙʟᴏᴄᴋ
┃│◦ ᴜɴʙʟᴏᴄᴋ
┃│◦ ᴘᴘ
┃│◦ ғᴜʟʟᴘᴘ
┃└──────────⭓
┠┌─⭓『    *MANAGE*    』
┃│◦ ᴀᴍᴜᴛᴇ
┃│◦ ᴀᴜɴᴍᴜᴛᴇ
┃│◦ ᴘᴅᴍ
┃│◦ ᴀɴᴛɪʟɪɴᴋ
┃│◦ ᴀɴᴛɪᴡᴏʀᴅ
┃│◦ ᴀɴᴛɪғᴀᴋᴇ
┃│◦ ᴅᴇʟғᴀᴋᴇ
┃│◦ ᴅᴇʟᴡᴏʀᴅ
┃│◦ ᴅᴇʟᴍᴜᴛᴇ
┃│◦ ᴅᴇʟᴜɴᴍᴜᴛᴇ
┃│◦ ɢᴇᴛғᴀᴋᴇ
┃│◦ ɢᴇᴛᴡᴏʀᴅ
┃│◦ ɢᴇᴛᴍᴜᴛᴇ
┃│◦ ɢᴇᴛᴜɴᴍᴜᴛᴇ
┃└──────────⭓
┠┌─⭓『    *SEARCH*    』
┃│◦ ɪᴍɢ
┃│◦ ʟʏʀɪᴄs
┃│◦ ɢᴏᴏɢʟᴇ
┃│◦ ʀɪɴɢᴛᴏɴᴇ
┃│◦ ᴡᴇᴀᴛʜᴇʀ
┃│◦ ᴛʀᴛ
┃│◦ ᴛʀᴜᴇ
┃│◦ ɪsᴡᴀ
┃│◦ ɴᴏᴡᴀ
┃└──────────⭓
┠┌─⭓『   *DOWNLOAD*   』
┃│◦ ɪɴsᴛᴀ
┃│◦ sᴛᴏʀʏ
┃└──────────⭓
┠┌─⭓『    *CREATE*    』
┃│◦ ᴇᴍɪx
┃│◦ ǫʀ
┃└──────────⭓
┠┌─⭓『  *DOWNLOADER*  』
┃│◦ ᴘʟᴀʏ
┃│◦ sᴏɴɢ
┃│◦ ᴠɪᴅᴇᴏ
┃└──────────⭓
┠┌─⭓『   *DATABASE*   』
┃│◦ ɢᴇᴛᴠᴀʀ
┃└──────────⭓
┠┌─⭓『   *SETTINGS*   』
┃│◦ ᴘʀᴇғɪx
┃│◦ ᴀᴅᴀᴛᴀ
┃│◦ sᴅᴀᴛᴀ
┃│◦ ʙɪᴏ
┃│◦ ʟᴀɴɢ
┃│◦ ᴀɴᴛɪʙᴏᴛ
┃│◦ ʙᴀɴ
┃│◦ ᴜɴʙᴀɴ
┃│◦ ʙɪɴғᴏ
┃│◦ sᴜᴅᴏ
┃└──────────⭓
┠┌─⭓『    *GENERAL*    』
┃│◦ ᴊɪᴅ
┃└──────────⭓
╰━━━━━━━━━━━━━◉`
            )
        }
        
    }
    })
    
    
    client.on('ready', () => {
        console.log('Client is ready!');
    });
    
    client.initialize();
    
    
    res.send()

});


app.listen(PORT,()=>{
    console.log(`PORT LISTENING ON ${PORT}`);
})

