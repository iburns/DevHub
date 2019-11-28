const { ipcRenderer } = require('electron')

function debounce(func, wait, immediate) {
  var timeout;

  return function executedFunction() {
    var context = this;
    var args = arguments;
	    
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    var callNow = immediate && !timeout;
	
    clearTimeout(timeout);

    timeout = setTimeout(later, wait);
	
    if (callNow) func.apply(context, args);
  };
};

var toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
  ['blockquote', 'code-block'],

  // [{ 'header': 1 }, { 'header': 2 }],               // custom button values
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
  [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
  // [{ 'direction': 'rtl' }],                         // text direction

  [{ 'font': [] }],
  [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

  [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
  [{ 'align': [] }],

  ['clean']                                         // remove formatting button
];

hljs.configure({   // optionally configure hljs
  languages: ['javascript', 'ruby', 'python']
});

var quill = new Quill('#editor', {
  modules: {
    syntax: true,              // Include syntax module
    toolbar: toolbarOptions  // Include button in toolbar
  },
  theme: 'snow'
});

//var Delta = Quill.import('delta');
// // Store accumulated changes
// var change = new Delta();
// quill.on('text-change', function(delta) {
//   change = change.compose(delta);
// });

function vm() {
  var self = this;

  self.title = ko.observable("Title");

  self.save = function() {
    console.log('saving');
    const result = ipcRenderer.sendSync('save-note', JSON.stringify(quill.getContents()));
  }

  self.load = function() {
    const result = ipcRenderer.sendSync('load-note');
    quill.setContents(JSON.parse(result));
  }


  self.load();

  return self;
}

var viewModel = vm();
ko.applyBindings(viewModel);

quill.on('text-change', debounce(function(delta, oldDelta, source) {
  viewModel.save();
}, 1500));
