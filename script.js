"use strict";

const chatForm = document.getElementById("chat-form");
const chatLog = document.getElementById("chat-log");
const clearChatButton = document.getElementById("clear-chat");
const voiceButton = document.getElementById("voice-btn");
const promptField = document.getElementById("prompt");
const voiceStatus = document.getElementById("voice-status");

const appendMessage = (role, content) => {
	if (!chatLog) return;
	const message = document.createElement("div");
	message.className = `chat-msg ${role}`;
	message.textContent = content;
	chatLog.appendChild(message);
	chatLog.scrollTop = chatLog.scrollHeight;
};

const OLLAMA_MODEL = "ministral-3:3b";

const sendToOllama = async (prompt) => {
	const response = await fetch("http://localhost:11434/api/chat", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			model: OLLAMA_MODEL,
			messages: [
				{
					role: "system",
					content: "You are a concise assistant. Answer briefly, directly, and without filler."
				},
				{ role: "user", content: prompt }
			],
			stream: false
		})
	});

	if (!response.ok) {
		throw new Error(`Ollama error: ${response.status}`);
	}

	const data = await response.json();
	return data?.message?.content || "(no response)";
};

chatForm?.addEventListener("submit", async (event) => {
	event.preventDefault();
	const prompt = chatForm.prompt.value.trim();
	if (!prompt) return;
	await handlePromptSubmit(prompt);
});

const handlePromptSubmit = async (prompt) => {
	appendMessage("user", prompt);
	if (chatForm?.prompt) {
		chatForm.prompt.value = "";
	}

	try {
		const reply = await sendToOllama(prompt);
		appendMessage("ai", reply);
	} catch (error) {
		appendMessage("ai", "Unable to reach Ollama. Is it running on localhost:11434?");
	}
};

clearChatButton?.addEventListener("click", () => {
	if (chatLog) {
		chatLog.innerHTML = "";
	}
});

if (voiceButton) {
	const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
	if (!SpeechRecognition) {
		voiceButton.disabled = true;
		voiceButton.textContent = "Voice (unsupported)";
	} else {
		const recognition = new SpeechRecognition();
		recognition.lang = "en-US";
		recognition.continuous = false;
		recognition.interimResults = false;
		recognition.maxAlternatives = 1;
		let isListening = false;
		let isPressed = false;
		let lastTranscript = "";
		let shouldRestart = false;

		const setStatus = (message) => {
			if (voiceStatus) {
				voiceStatus.textContent = message;
			}
		};

		const startListening = () => {
			if (isListening) return;
			isListening = true;
			voiceButton.textContent = "Listening...";
			setStatus("Listening for speech...");
			recognition.start();
		};

		const stopListening = () => {
			if (!isListening) return;
			isListening = false;
			voiceButton.textContent = "Voice";
			setStatus("Stopped.");
			recognition.stop();
		};

		voiceButton.addEventListener("pointerdown", (event) => {
			event.preventDefault();
			isPressed = true;
			shouldRestart = true;
			startListening();
		});

		voiceButton.addEventListener("pointerup", () => {
			isPressed = false;
			shouldRestart = false;
			stopListening();
		});

		voiceButton.addEventListener("pointerleave", () => {
			isPressed = false;
			shouldRestart = false;
			stopListening();
		});

		voiceButton.addEventListener("pointercancel", () => {
			isPressed = false;
			shouldRestart = false;
			stopListening();
		});

		recognition.addEventListener("result", (event) => {
			const transcript = event.results[0][0].transcript;
			lastTranscript = transcript;
			if (promptField) {
				promptField.value = transcript;
			}
			setStatus(`Heard: ${transcript}`);
		});

		recognition.addEventListener("end", () => {
			isListening = false;
			if (shouldRestart && isPressed) {
				setStatus("Restarting recognition...");
				startListening();
			} else {
				voiceButton.textContent = "Voice";
				const transcript = promptField?.value.trim() || lastTranscript.trim();
				if (transcript) {
					setStatus("Sending message...");
					handlePromptSubmit(transcript);
					lastTranscript = "";
				} else {
					setStatus("No speech detected.");
				}
			}
		});

		recognition.addEventListener("error", (event) => {
			isListening = false;
			voiceButton.textContent = "Voice";
			setStatus(`Error: ${event.error || "unknown"}`);
		});
	}
}
