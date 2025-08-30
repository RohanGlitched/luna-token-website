/**
 * Luna Launch Professional Live Chat
 * Static site compatible with external integrations
 */

class LunaChat {
    constructor(options = {}) {
        this.options = {
            position: 'bottom-right',
            theme: 'light',
            welcomeMessage: 'Hi! How can we help you with Luna Launch?',
            supportTeam: 'Luna Support',
            autoOpen: false,
            showNotification: true,
            integrationMode: 'demo', // 'demo', 'tawk', 'intercom', 'crisp', 'custom'
            customEndpoint: null,
            ...options
        };
        
        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;
        this.unreadCount = 0;
        
        this.init();
    }

    init() {
        this.createWidget();
        this.attachEventListeners();
        this.loadInitialMessages();
        
        // Auto-show notification after delay
        if (this.options.showNotification) {
            setTimeout(() => this.showNotification(), 3000);
        }
    }

    createWidget() {
        // Check if widget already exists in HTML
        const existingWidget = document.querySelector('.luna-chat-widget');
        if (!existingWidget) {
            // Create widget if it doesn't exist (fallback)
            const widget = document.createElement('div');
            widget.className = 'luna-chat-widget';
            widget.innerHTML = `
                <!-- Chat Button -->
                <div class="luna-chat-button" id="lunaChatButton">
                    <svg class="luna-chat-icon" viewBox="0 0 24 24">
                        <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M6,9H18V11H6M14,14H6V12H14"/>
                    </svg>
                    <div class="luna-chat-badge" id="lunaChatBadge" style="display: none;">1</div>
                </div>

                <!-- Chat Window -->
                <div class="luna-chat-window" id="lunaChatWindow">
                    <!-- Header -->
                    <div class="luna-chat-header">
                        <div class="luna-chat-avatar">LS</div>
                        <div class="luna-chat-info">
                            <h3>${this.options.supportTeam}</h3>
                            <div class="luna-chat-status">
                                <span class="luna-status-dot"></span>
                                Online - We reply instantly
                            </div>
                        </div>
                        <button class="luna-chat-close" id="lunaChatClose">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Messages Area -->
                    <div class="luna-chat-messages" id="lunaChatMessages">
                        <div class="luna-welcome">
                            <h4>Welcome to Luna Launch! 👋</h4>
                            <p>${this.options.welcomeMessage}</p>
                        </div>
                    </div>

                    <!-- Typing Indicator -->
                    <div class="luna-typing" id="lunaTyping">
                        <div class="luna-typing-dots">
                            <div class="luna-typing-dot"></div>
                            <div class="luna-typing-dot"></div>
                            <div class="luna-typing-dot"></div>
                        </div>
                        <span style="font-size: 12px; color: #64748b;">Support is typing...</span>
                    </div>

                    <!-- Quick Actions -->
                    <div class="luna-quick-actions" id="lunaQuickActions">
                        <div class="luna-quick-action" data-message="How do I create a token?">💰 Create Token</div>
                        <div class="luna-quick-action" data-message="What are the fees?">💵 Pricing</div>
                        <div class="luna-quick-action" data-message="Is this secure?">🔒 Security</div>
                        <div class="luna-quick-action" data-message="Technical support needed">🛠️ Tech Support</div>
                    </div>

                    <!-- Input Area -->
                    <div class="luna-chat-input-area">
                        <div class="luna-chat-input-container">
                            <textarea 
                                class="luna-chat-input" 
                                id="lunaChatInput" 
                                placeholder="Type your message..."
                                rows="1"
                            ></textarea>
                            <button class="luna-chat-send" id="lunaChatSend" disabled>
                                <svg class="luna-send-icon" viewBox="0 0 24 24">
                                    <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(widget);
        }
        
        // Cache DOM elements (works with both existing HTML and dynamically created)
        this.elements = {
            button: document.querySelector('#lunaChatButton'),
            window: document.querySelector('#lunaChatWindow'),
            close: document.querySelector('#lunaChatClose'),
            messages: document.querySelector('#lunaChatMessages'),
            input: document.querySelector('#lunaChatInput'),
            send: document.querySelector('#lunaChatSend'),
            badge: document.querySelector('#lunaChatBadge'),
            typing: document.querySelector('#lunaTyping'),
            quickActions: document.querySelector('#lunaQuickActions')
        };
    }

    attachEventListeners() {
        // Toggle chat window
        this.elements.button.addEventListener('click', () => this.toggleChat());
        this.elements.close.addEventListener('click', () => this.closeChat());
        
        // Send message
        this.elements.send.addEventListener('click', () => this.sendMessage());
        this.elements.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize textarea and enable/disable send button
        this.elements.input.addEventListener('input', () => {
            this.autoResizeTextarea();
            this.toggleSendButton();
        });
        
        // Quick actions
        this.elements.quickActions.addEventListener('click', (e) => {
            if (e.target.classList.contains('luna-quick-action')) {
                const message = e.target.dataset.message;
                this.sendMessage(message);
            }
        });
        
        // Close chat when clicking outside (optional)
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.luna-chat-widget') && this.isOpen) {
                // Uncomment if you want to close on outside click
                // this.closeChat();
            }
        });
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        this.isOpen = true;
        this.elements.button.classList.add('active');
        this.elements.window.classList.add('active');
        this.elements.input.focus();
        this.hideNotification();
        
        // Hide quick actions after first interaction
        if (this.messages.length > 0) {
            this.elements.quickActions.style.display = 'none';
        }
        
        // Analytics tracking
        this.trackEvent('chat_opened');
    }

    closeChat() {
        this.isOpen = false;
        this.elements.button.classList.remove('active');
        this.elements.window.classList.remove('active');
        
        // Analytics tracking
        this.trackEvent('chat_closed');
    }

    sendMessage(text = null) {
        const message = text || this.elements.input.value.trim();
        if (!message) return;

        // Add user message
        this.addMessage({
            text: message,
            sender: 'user',
            timestamp: new Date()
        });

        // Clear input
        this.elements.input.value = '';
        this.autoResizeTextarea();
        this.toggleSendButton();
        
        // Hide quick actions after first message
        this.elements.quickActions.style.display = 'none';

        // Handle response based on integration mode
        this.handleUserMessage(message);
        
        // Analytics tracking
        this.trackEvent('message_sent', { message: message.substring(0, 50) });
    }

    handleUserMessage(message) {
        switch (this.options.integrationMode) {
            case 'demo':
                this.handleDemoResponse(message);
                break;
            case 'tawk':
                this.handleTawkIntegration(message);
                break;
            case 'intercom':
                this.handleIntercomIntegration(message);
                break;
            case 'crisp':
                this.handleCrispIntegration(message);
                break;
            case 'custom':
                this.handleCustomIntegration(message);
                break;
            default:
                this.handleDemoResponse(message);
        }
    }

    handleDemoResponse(message) {
        // Show typing indicator
        this.showTyping();
        
        // Simulate response delay
        setTimeout(() => {
            this.hideTyping();
            
            let response = this.generateDemoResponse(message);
            this.addMessage({
                text: response,
                sender: 'support',
                timestamp: new Date()
            });
        }, 1000 + Math.random() * 2000);
    }

    generateDemoResponse(message) {
        const responses = {
            greeting: [
                "Hello! Welcome to Luna Launch. I'm here to help you create and deploy your Solana tokens. What would you like to know?",
                "Hi there! Thanks for choosing Luna Launch. How can I assist you with your token creation today?",
                "Welcome! I'm ready to help you with any questions about our Solana token launcher. What's on your mind?"
            ],
            fees: [
                "Our base token creation fee is just 0.3 SOL, which includes all standard features and authority revocations. Additional features like social links (+0.1 SOL) and creator info (+0.1 SOL) are optional.",
                "Luna Launch offers competitive pricing at 0.3 SOL for basic token creation. This includes deployment, metadata setup, and security features. Would you like to see our full pricing breakdown?"
            ],
            security: [
                "Security is our top priority! We use industry-standard practices, automatic authority revocations, and our smart contracts are audited. Your tokens are deployed directly to the Solana blockchain with full transparency.",
                "Absolutely secure! We provide authority revocation options, use secure deployment methods, and all transactions are transparent on the Solana blockchain. Your wallet remains in your control at all times."
            ],
            create: [
                "Creating a token is easy! Just visit our Create Token page, fill in your token details (name, symbol, supply), upload a logo, and we'll handle the deployment. The whole process takes just a few minutes!",
                "To create your token: 1) Connect your Solana wallet, 2) Enter token details, 3) Upload logo, 4) Choose features, 5) Pay fees, and we deploy it instantly to Solana mainnet!"
            ],
            support: [
                "I'm here to help with any technical issues! You can also join our Discord community for peer support, or contact our development team for advanced technical questions. What specific issue are you experiencing?",
                "Our technical support covers wallet connection issues, transaction problems, token deployment questions, and platform bugs. What technical challenge can I help you solve?"
            ]
        };
        
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return this.getRandomResponse(responses.greeting);
        } else if (lowerMessage.includes('fee') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
            return this.getRandomResponse(responses.fees);
        } else if (lowerMessage.includes('secure') || lowerMessage.includes('safety') || lowerMessage.includes('safe')) {
            return this.getRandomResponse(responses.security);
        } else if (lowerMessage.includes('create') || lowerMessage.includes('token') || lowerMessage.includes('deploy')) {
            return this.getRandomResponse(responses.create);
        } else if (lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('technical')) {
            return this.getRandomResponse(responses.support);
        } else {
            return "Thanks for your message! For detailed assistance, please join our Discord community at https://discord.gg/lunalaunch or check our documentation. Our team typically responds within 5 minutes during business hours.";
        }
    }

    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Integration handlers for external services
    handleTawkIntegration(message) {
        // Integration with Tawk.to
        if (window.Tawk_API) {
            window.Tawk_API.sendMessage(message);
        }
    }

    handleIntercomIntegration(message) {
        // Integration with Intercom
        if (window.Intercom) {
            window.Intercom('sendMessage', message);
        }
    }

    handleCrispIntegration(message) {
        // Integration with Crisp
        if (window.$crisp) {
            window.$crisp.push(['do', 'message:send', ['text', message]]);
        }
    }

    handleCustomIntegration(message) {
        // Custom API integration
        if (this.options.customEndpoint) {
            fetch(this.options.customEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, timestamp: new Date().toISOString() })
            }).then(response => response.json())
              .then(data => {
                  if (data.reply) {
                      this.addMessage({
                          text: data.reply,
                          sender: 'support',
                          timestamp: new Date()
                      });
                  }
              });
        }
    }

    addMessage(message) {
        this.messages.push(message);
        
        const messageElement = document.createElement('div');
        messageElement.className = `luna-message ${message.sender}`;
        
        const time = message.timestamp.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit' 
        });
        
        messageElement.innerHTML = `
            <div class="luna-message-bubble">${this.escapeHtml(message.text)}</div>
            <div class="luna-message-time">${time}</div>
        `;
        
        this.elements.messages.appendChild(messageElement);
        this.scrollToBottom();
        
        // Update unread count if chat is closed
        if (!this.isOpen && message.sender === 'support') {
            this.unreadCount++;
            this.updateBadge();
        }
    }

    showTyping() {
        this.isTyping = true;
        if (this.elements.typing) {
            this.elements.typing.style.display = 'flex';
            this.elements.typing.classList.add('active');
            this.scrollToBottom();
        }
    }

    hideTyping() {
        this.isTyping = false;
        if (this.elements.typing) {
            this.elements.typing.classList.remove('active');
            // Small delay before hiding to allow animation to complete
            setTimeout(() => {
                if (!this.isTyping) {
                    this.elements.typing.style.display = 'none';
                }
            }, 300);
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        }, 100);
    }

    autoResizeTextarea() {
        const textarea = this.elements.input;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 80) + 'px';
    }

    toggleSendButton() {
        const hasText = this.elements.input.value.trim().length > 0;
        this.elements.send.disabled = !hasText;
    }

    showNotification() {
        if (!this.isOpen) {
            this.unreadCount = 1;
            this.updateBadge();
        }
    }

    hideNotification() {
        this.unreadCount = 0;
        this.updateBadge();
    }

    updateBadge() {
        if (this.unreadCount > 0) {
            this.elements.badge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount;
            this.elements.badge.style.display = 'flex';
        } else {
            this.elements.badge.style.display = 'none';
        }
    }

    loadInitialMessages() {
        // Load any saved messages from localStorage
        const saved = localStorage.getItem('luna_chat_messages');
        if (saved) {
            try {
                const messages = JSON.parse(saved);
                messages.forEach(msg => this.addMessage(msg));
            } catch (e) {
                console.warn('Failed to load saved messages');
            }
        }
    }

    saveMessages() {
        try {
            localStorage.setItem('luna_chat_messages', JSON.stringify(this.messages));
        } catch (e) {
            console.warn('Failed to save messages');
        }
    }

    trackEvent(event, data = {}) {
        // Analytics integration
        if (window.gtag) {
            gtag('event', event, {
                event_category: 'Live Chat',
                ...data
            });
        }
        
        // Custom analytics
        if (this.options.onEvent) {
            this.options.onEvent(event, data);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public API methods
    open() {
        this.openChat();
    }

    close() {
        this.closeChat();
    }

    sendCustomMessage(text) {
        this.addMessage({
            text: text,
            sender: 'support',
            timestamp: new Date()
        });
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Luna Chat
    window.lunaChat = new LunaChat({
        supportTeam: 'Luna Launch Support',
        welcomeMessage: 'Hi! How can we help you with creating your Solana token?',
        showNotification: true,
        integrationMode: 'demo' // Change to 'tawk', 'intercom', 'crisp', or 'custom'
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LunaChat;
}