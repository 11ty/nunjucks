(function() {
  'use strict';

  var expect,
    precompile,
    precompileString;

  if (typeof require !== 'undefined') {
    expect = globalThis.expect;
    precompile = require('../nunjucks/src/precompile').precompile;
    precompileString = require('../nunjucks/src/precompile').precompileString;
  } else {
    expect = globalThis.expect;
    precompile = nunjucks.precompile;
    precompileString = nunjucks.precompileString;
  }

  describe('precompile', function() {
    it('should return a string', function() {
      expect(precompileString('{{ test }}', {
        name: 'test.njk'
      })).toBeTypeOf('string');
    });

    describe('templates', function() {
      it('should return *NIX path seperators', function() {
        var fileName;

        precompile('./tests/templates/item.njk', {
          wrapper: function(templates) {
            fileName = templates[0].name;
          }
        });

        expect(fileName).toBe('./tests/templates/item.njk');
      });

      it('should return *NIX path seperators, when name is passed as option', function() {
        var fileName;

        precompile('<span>test</span>', {
          name: 'path\\to\\file.j2',
          isString: true,
          wrapper: function(templates) {
            fileName = templates[0].name;
          }
        });

        expect(fileName).toBe('path/to/file.j2');
      });
    });
  });
}());
