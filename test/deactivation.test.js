const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-dom/test-utils');
const FocusTrap = require('../dist/focus-trap-react');

describe('deactivation', () => {
  let domContainer;
  const mockFocusTrap = {
    activate: jest.fn(),
    deactivate: jest.fn(),
    pause: jest.fn()
  };
  let mockCreateFocusTrap;

  beforeEach(() => {
    mockCreateFocusTrap = jest.fn(() => mockFocusTrap);
    domContainer = document.createElement('div');
    document.body.appendChild(domContainer);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(domContainer);
    document.body.removeChild(domContainer);
  });

  test('deactivation', () => {
    class TestZone extends React.Component {
      state = {
        trapActive: true
      };

      deactivateTrap = () => {
        this.setState({ trapActive: false });
      };

      render() {
        return (
          <div>
            <button ref="trigger" onClick={this.deactivateTrap}>
              deactivate
            </button>
            <FocusTrap
              ref="trap"
              _createFocusTrap={mockCreateFocusTrap}
              active={this.state.trapActive}
            >
              <div>
                <button>
                  something special
                </button>
              </div>
            </FocusTrap>
          </div>
        );
      }
    }

    const zone = ReactDOM.render(<TestZone />, domContainer);

    expect(mockFocusTrap.deactivate).toHaveBeenCalledTimes(0);

    TestUtils.Simulate.click(ReactDOM.findDOMNode(zone.refs.trigger));

    expect(mockFocusTrap.deactivate).toHaveBeenCalledTimes(1);
  });

  test('deactivation respects `returnFocusOnDeactivate` option', () => {
    class TestZone extends React.Component {
      state = {
        trapActive: true
      };

      deactivateTrap = () => {
        this.setState({ trapActive: false });
      };

      render() {
        return (
          <div>
            <button ref="trigger" onClick={this.deactivateTrap}>
              deactivate
            </button>
            <FocusTrap
              ref={(component) => this.trap = component}
              _createFocusTrap={mockCreateFocusTrap}
              active={this.state.trapActive}
              focusTrapOptions={{ returnFocusOnDeactivate: true }}
            >
              <div>
                <button>
                  something special
                </button>
              </div>
            </FocusTrap>
          </div>
        );
      }
    }

    const zone = ReactDOM.render(<TestZone />, domContainer);
    // mock deactivate on the fouscTrap instance for we can asset
    // that we are passing the correct config to the focus trap.
    zone.trap.focusTrap.deactivate = jest.fn();

    TestUtils.Simulate.click(ReactDOM.findDOMNode(zone.refs.trigger));

    expect(zone.trap.focusTrap.deactivate).toHaveBeenCalledWith({ returnFocus: true });
  });

  test('deactivation by dismount', () => {
    class TestZone extends React.Component {
      state = {
        trapActive: true
      };

      deactivateTrap = () => {
        this.setState({ trapActive: false });
      };

      render() {
        const trap = this.state.trapActive
          ? <FocusTrap _createFocusTrap={mockCreateFocusTrap} ref="trap">
              <button>
                something special
              </button>
            </FocusTrap>
          : false;

        return (
          <div>
            <button ref="trigger" onClick={this.deactivateTrap}>
              deactivate
            </button>
            {trap}
          </div>
        );
      }
    }

    const zone = ReactDOM.render(<TestZone />, domContainer);

    expect(mockFocusTrap.deactivate).toHaveBeenCalledTimes(0);

    TestUtils.Simulate.click(ReactDOM.findDOMNode(zone.refs.trigger));

    expect(mockFocusTrap.deactivate).toHaveBeenCalledTimes(1);
  });
});
