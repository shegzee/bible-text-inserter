// tiptap-editor.js
// Self-contained TipTap editor using CDN imports

class TiptapEditor {
    constructor(elementId, initialContent = '<p>Start typing...</p>') {
        this.elementId = elementId;
        this.element = document.getElementById(elementId);
        this.container = this.element.closest('.tiptap-editor-container');
        this.toolbar = this.container.querySelector('.tiptap-toolbar');
        this.editor = null;
        
        // Load TipTap dynamically then initialize
        this.loadTiptap().then(() => {
            this.initializeEditor(initialContent);
        });
    }
    
    async loadTiptap() {
        // Check if TipTap is already loaded
        if (window.TiptapCore) return;
        
        // Load TipTap modules dynamically
        const [
            { Editor },
            StarterKit
        ] = await Promise.all([
            import('https://esm.sh/@tiptap/core'),
            import('https://esm.sh/@tiptap/starter-kit')
        ]);
        
        // Store in window for reuse
        window.TiptapCore = { Editor };
        window.TiptapStarterKit = StarterKit.default;
    }
    
    initializeEditor(initialContent) {
        this.editor = new window.TiptapCore.Editor({
            element: this.element,
            extensions: [window.TiptapStarterKit],
            content: initialContent,
            onUpdate: () => this.updateToolbar(),
            onSelectionUpdate: () => this.updateToolbar()
        });
        
        this.bindEvents();
        setTimeout(() => this.updateToolbar(), 100);
    }
    
    bindEvents() {
        this.toolbar.addEventListener('click', (e) => {
            if (e.target.classList.contains('tiptap-btn')) {
                e.preventDefault();
                const action = e.target.dataset.action;
                this.executeAction(action);
            }
        });
    }
    
    executeAction(action) {
        if (!this.editor) return;
        
        switch(action) {
            case 'bold':
                this.editor.chain().focus().toggleBold().run();
                break;
            case 'italic':
                this.editor.chain().focus().toggleItalic().run();
                break;
            case 'underline':
                this.editor.chain().focus().toggleUnderline().run();
                break;
            case 'h1':
                this.editor.chain().focus().toggleHeading({ level: 1 }).run();
                break;
            case 'h2':
                this.editor.chain().focus().toggleHeading({ level: 2 }).run();
                break;
            case 'h3':
                this.editor.chain().focus().toggleHeading({ level: 3 }).run();
                break;
            case 'paragraph':
                this.editor.chain().focus().setParagraph().run();
                break;
        }
        this.updateToolbar();
    }
    
    updateToolbar() {
        if (!this.editor) return;
        
        const buttons = this.toolbar.querySelectorAll('.tiptap-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        if (this.editor.isActive('bold')) {
            this.toolbar.querySelector('[data-action="bold"]').classList.add('active');
        }
        if (this.editor.isActive('italic')) {
            this.toolbar.querySelector('[data-action="italic"]').classList.add('active');
        }
        if (this.editor.isActive('underline')) {
            this.toolbar.querySelector('[data-action="underline"]').classList.add('active');
        }
        if (this.editor.isActive('heading', { level: 1 })) {
            this.toolbar.querySelector('[data-action="h1"]').classList.add('active');
        }
        if (this.editor.isActive('heading', { level: 2 })) {
            this.toolbar.querySelector('[data-action="h2"]').classList.add('active');
        }
        if (this.editor.isActive('heading', { level: 3 })) {
            this.toolbar.querySelector('[data-action="h3"]').classList.add('active');
        }
        if (this.editor.isActive('paragraph')) {
            this.toolbar.querySelector('[data-action="paragraph"]').classList.add('active');
        }
    }
    
    // Utility methods
    getHTML() {
        return this.editor ? this.editor.getHTML() : '';
    }
    
    getText() {
        return this.editor ? this.editor.getText() : '';
    }
    
    setContent(content) {
        if (this.editor) {
            this.editor.commands.setContent(content);
        }
    }
    
    focus() {
        if (this.editor) {
            this.editor.commands.focus();
        }
    }
    
    destroy() {
        if (this.editor) {
            this.editor.destroy();
        }
    }
}

// Initialize function to be called from HTML
function initializeTiptapEditors() {
    // Initialize editors
    const editor1 = new TiptapEditor('editor1', '<p>This is the first editor. Type here...</p>');
    const editor2 = new TiptapEditor('editor2', '<p>This is the second editor. Type here too...</p>');
    
    // Make editors available globally
    window.tiptapEditors = { editor1, editor2 };
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTiptapEditors);
} else {
    initializeTiptapEditors();
}