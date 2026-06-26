(function() {
  'use strict';

  var expect,
    nunjucks,
    fs,
    os,
    path;

  if (typeof require !== 'undefined') {
    expect = globalThis.expect;
    nunjucks = require('../nunjucks/index');
    fs = require('fs');
    path = require('path');
    os = require('os');
  } else {
    expect = globalThis.expect;
    nunjucks = window.nunjucks;
  }

  function rmdir(dirPath) {
    if(!fs.existsSync(dirPath)) {
      return;
    }

    fs.rmSync(dirPath, { recursive: true, force: true });
  }

  function emptyDir(dir) {
    let items
    try {
      items = fs.readdirSync(dir)
    } catch {
      throw new Error('Directory does not exist.');
    }

    items.forEach(item => {
      item = path.join(dir, item)
      fs.rmSync(item)
    })
  }

  function writeFile(filePath, contents) {
    fs.writeFileSync(filePath, contents, {
      encoding: 'utf-8',
      recursive: true,
    });
  }

  describe('nunjucks.configure', function() {
    var tempdir;

    before(function() {
      if (fs && path && os) {
        try {
          tempdir = fs.mkdtempSync(path.join(os.tmpdir(), 'templates'));
          emptyDir(tempdir);
        } catch (e) {
          rmdir(tempdir);
          throw e;
        }
      }
    });

    after(function() {
      nunjucks.reset();
      if (typeof tempdir !== 'undefined') {
        rmdir(tempdir);
      }
    });

    it('should cache templates by default', function() {
      if (typeof fs === 'undefined') {
        this.skip();
        return;
      }
      nunjucks.configure(tempdir);

      writeFile(tempdir + '/test.html', '{{ name }}');
      expect(nunjucks.render('test.html', {name: 'foo'})).toBe('foo');

      writeFile(tempdir + '/test.html', '{{ name }}-changed');
      expect(nunjucks.render('test.html', {name: 'foo'})).toBe('foo');
    });

    it('should not cache templates with {noCache: true}', function() {
      if (typeof fs === 'undefined') {
        this.skip();
        return;
      }
      nunjucks.configure(tempdir, {noCache: true});

      writeFile(tempdir + '/test.html', '{{ name }}');
      expect(nunjucks.render('test.html', {name: 'foo'})).toBe('foo');

      writeFile(tempdir + '/test.html', '{{ name }}-changed');
      expect(nunjucks.render('test.html', {name: 'foo'})).toBe('foo-changed');
    });
  });
}());
