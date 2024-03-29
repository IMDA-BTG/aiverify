describe('table.getScope', function () {
  'use strict';

  function $id(id) {
    return document.getElementById(id);
  }

  var fixture = $id('fixture');
  var fixtureSetup = axe.testUtils.fixtureSetup;

  it('returns false for TD without scope attribute', function () {
    fixture.innerHTML =
      '<table>' +
      '<tr><td></td><td id="target">1</td></tr>' +
      '<tr><th>2</th><td>ok</td></tr>' +
      '</table>';

    var target = $id('target');
    fixtureSetup();
    assert.equal(axe.commons.table.getScope(target), false);
  });

  it('throws if it is not passed a data cell', function () {
    assert.throws(function () {
      axe.commons.table.getScope();
    }, TypeError);

    var node = document.createElement('tr');
    axe.utils.getFlattenedTree(node);

    assert.throws(function () {
      axe.commons.table.getScope(node);
    }, TypeError);
  });

  it('does not throw if it is passed a data cell', function () {
    var node = document.createElement('td');
    axe.utils.getFlattenedTree(node);
    assert.doesNotThrow(function () {
      axe.commons.table.getScope(node);
    });
  });

  describe('auto scope', function () {
    it('return `auto` with implicit row and col scope', function () {
      fixture.innerHTML =
        '<table>' +
        '<tr><th id="target">1</th><td>ok</td></tr>' +
        '<tr><td>ok</td><td>ok</td></tr>' +
        '</table>';

      var target = $id('target');
      axe.testUtils.flatTreeSetup(fixture.firstChild);
      assert.equal(axe.commons.table.getScope(target), 'auto');
    });

    it('return `auto` with implicit row and col scope, not in the first column', function () {
      fixture.innerHTML =
        '<table>' +
        '<tr><td></td><th id="target">1</th></tr>' +
        '<tr><th>2</th><td>ok</td><td></td></tr>' +
        '</table>';

      var target = $id('target');
      axe.testUtils.flatTreeSetup(fixture.firstChild);
      assert.equal(axe.commons.table.getScope(target), 'auto');
    });

    it('return `auto` with implicit row and col scope, not in the first row', function () {
      fixture.innerHTML =
        '<table>' +
        '<tr><td></td><th>1</th></tr>' +
        '<tr><th id="target">2</th><td>ok</td><td></td></tr>' +
        '</table>';

      var target = $id('target');
      axe.testUtils.flatTreeSetup(fixture.firstChild);
      assert.equal(axe.commons.table.getScope(target), 'auto');
    });

    it('return `auto` without an actualNode or in the tree', function () {
      var serialNode = new axe.SerialVirtualNode({
        nodeName: 'th'
      });

      assert.equal(axe.commons.table.getScope(serialNode), 'auto');
    });
  });

  describe('col scope', function () {
    it('returns `col` with explicit col scope on TH', function () {
      fixture.innerHTML =
        '<table>' +
        '<tr><td></td><th id="target" scope="col">1</th></tr>' +
        '<tr><th>2</th><td>ok</td><td></td></tr>' +
        '</table>';

      var target = $id('target');
      fixtureSetup();
      assert.equal(axe.commons.table.getScope(target), 'col');
    });

    it('returns `col` with explicit col scope on TD', function () {
      fixture.innerHTML =
        '<table>' +
        '<tr><td></td><td id="target" scope="col">1</td></tr>' +
        '<tr><th>2</th><td>ok</td></tr>' +
        '</table>';

      var target = $id('target');
      fixtureSetup();
      assert.equal(axe.commons.table.getScope(target), 'col');
    });

    it('returns `col` with role = columnheader on TD', function () {
      fixture.innerHTML =
        '<table>' +
        '<tr><td></td><td id="target" scope="row" role="columnheader">1</td></tr>' +
        '<tr><th>2</th><td>ok</td></tr>' +
        '</table>';

      var target = $id('target');
      fixtureSetup();
      assert.equal(axe.commons.table.getScope(target), 'col');
    });

    it('returns `col` when part of a row of all TH elements', function () {
      fixture.innerHTML =
        '<table>' +
        '<tr><th></th><th id="target">1</th></tr>' +
        '<tr><td>2</td><td>ok</td></tr>' +
        '</table>';

      var target = $id('target');
      axe.testUtils.flatTreeSetup(fixture.firstChild);
      assert.equal(axe.commons.table.getScope(target), 'col');
    });

    it('returns `col` when part of both a row and a column of all TH elements', function () {
      fixture.innerHTML =
        '<table>' +
        '<tr><th id="target">1</th><th></th></tr>' +
        '<tr><th>2</th><td>ok</td></tr>' +
        '</table>';

      var target = $id('target');
      axe.testUtils.flatTreeSetup(fixture.firstChild);
      assert.equal(axe.commons.table.getScope(target), 'col');
    });

    it('understands colspan on the table', function () {
      fixture.innerHTML =
        '<table>' +
        '<tr> <th colspan="2"></th> </tr>' +
        '<tr> <th id="target"></th> <th></th> </tr>' +
        '<tr> <td></td> <td></td> </tr>' +
        '</table>';
      var target = $id('target');
      axe.testUtils.flatTreeSetup(fixture.firstChild);
      assert.equal(axe.commons.table.getScope(target), 'col');
    });

    it('understands colspan on the cell', function () {
      fixture.innerHTML =
        '<table>' +
        '<tr> <th id="target" colspan="2"></th> </tr>' +
        '<tr> <td></td> <td></td> </tr>' +
        '</table>';
      var target = $id('target');
      axe.testUtils.flatTreeSetup(fixture.firstChild);
      assert.equal(axe.commons.table.getScope(target), 'col');
    });
  });

  describe('row scope', function () {
    it('returns `row` with explicit row scope on TH', function () {
      fixture.innerHTML =
        '<table>' +
        '<tr><td></td><th>1</th></tr>' +
        '<tr><th id="target" scope="row">2</th><td>ok</td><td></td></tr>' +
        '</table>';

      var target = $id('target');
      fixtureSetup();
      assert.equal(axe.commons.table.getScope(target), 'row');
    });

    it('returns `row` with explicit row scope on TD', function () {
      fixture.innerHTML =
        '<table>' +
        '<tr><td></td><td>1</td></tr>' +
        '<tr><td id="target" scope="row">2</td><td>ok</td></tr>' +
        '</table>';

      var target = $id('target');
      fixtureSetup();
      assert.equal(axe.commons.table.getScope(target), 'row');
    });

    it('returns `row` with role = rowheader on TD', function () {
      fixture.innerHTML =
        '<table>' +
        '<tr><td></td><td>1</td></tr>' +
        '<tr><td id="target" scope="col" role="rowheader">2</td><td>ok</td></tr>' +
        '</table>';

      var target = $id('target');
      fixtureSetup();
      assert.equal(axe.commons.table.getScope(target), 'row');
    });

    it('returns `row` when part of a column of all TH elements', function () {
      fixture.innerHTML =
        '<table>' +
        '<tr><th></th><td>1</td></tr>' +
        '<tr><th id="target">2</th><td>ok</td></tr>' +
        '</table>';

      var target = $id('target');
      axe.testUtils.flatTreeSetup(fixture.firstChild);
      assert.equal(axe.commons.table.getScope(target), 'row');
    });

    it('understands rowspan in the table', function () {
      fixture.innerHTML =
        '<table>' +
        '<tr> <th rowspan="2"></th> <th></th> <th></th> </tr>' +
        '<tr> <th id="target"></th> <td></td> </tr>' +
        '</table>';
      var target = $id('target');
      axe.testUtils.flatTreeSetup(fixture.firstChild);
      assert.equal(axe.commons.table.getScope(target), 'row');
    });

    it('understands rowspan on the cell', function () {
      fixture.innerHTML =
        '<table>' +
        '<tr> <th></th> <th></th> </tr>' +
        '<tr> <th id="target" rowspan="2"></th> <td></td> </tr>' +
        '<tr> <td></td> </tr>' +
        '</table>';
      var target = $id('target');
      axe.testUtils.flatTreeSetup(fixture.firstChild);
      assert.equal(axe.commons.table.getScope(target), 'row');
    });
  });

  it('does not throw on empty rows', function () {
    fixture.innerHTML =
      '<table>' +
      '<tr> </tr>' +
      '<tr> <th id="target">foo</th> <td>bar</td> </tr>' +
      '</table>';
    var target = $id('target');
    axe.testUtils.flatTreeSetup(fixture.firstChild);
    assert.equal(axe.commons.table.getScope(target), 'auto');
  });
});
