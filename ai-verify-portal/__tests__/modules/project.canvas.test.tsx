import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockDomMatrix, silentConsoleLogs } from '__mocks__/mockGlobals';
import { useEffect, useState } from 'react';
import ProjectCreatePage from 'pages/project/create';
import { getPlugins } from 'server/pluginManager';
import { MockProviders } from '__mocks__/mockProviders';
import PluginManagerType from 'src/types/pluginManager.interface';
import { MOCK_DATE_WIDGET_1, mockGqlDataE2E } from '__mocks__/mockGqlResponse';
import { widgetMdxBundleResponse } from '__mocks__/mockPlugins';

const GRID_LAYOUT_CLASSNAME = '.react-grid-layout';
const GRID_ITEM_CLASSNAME = '.react-grid-item';

function ProjectCreatePageWrapper() {
  const [plugins, setPlugins] = useState<PluginManagerType>();
  async function fetchPlugins() {
    const result = await getPlugins();
    return result;
  }
  useEffect(() => {
    (async () => {
      const fetchedPlugins = await fetchPlugins();
      setPlugins(fetchedPlugins);
    })();
  }, []);

  return <ProjectCreatePage pluginManager={plugins as PluginManagerType} />;
}

describe('Project Flow', () => {
  beforeAll(() => {
    silentConsoleLogs();
    mockDomMatrix();
    jest.useFakeTimers({ advanceTimers: true });
  });

  describe('Project Information Capture and Select Template screens', () => {
    it('should render Project Information Capture screen', async () => {
      const { container } = render(
        <MockProviders>
          <ProjectCreatePageWrapper />
        </MockProviders>
      );
      await screen.findByText(/^Create a new AI Testing Project$/i);
      expect(container).toMatchSnapshot('Project Information Capture Screen');
    });

    it('should NOT go to Select Report Template if Project Name is empty ', async () => {
      const user = userEvent.setup();
      render(
        <MockProviders>
          <ProjectCreatePageWrapper />
        </MockProviders>
      );
      await screen.findByText(/^Create a new AI Testing Project$/i);
      const projNameInput: HTMLInputElement =
        await screen.findByPlaceholderText(
          /^Enter name of this project e.g. Credit Scoring Model Tests$/i
        );
      await userEvent.type(projNameInput, ' ');
      jest.runAllTimers();
      const nextBtn = await screen.findByText(/^Next$/i);
      await user.click(nextBtn.parentElement as HTMLDivElement);
      await waitFor(() => {
        expect(screen.queryByText(/^Select Report Template$/i)).toBeNull();
      });
    });

    it('should go to Select Report Template if Project Name is filled ', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <MockProviders>
          <ProjectCreatePageWrapper />
        </MockProviders>
      );
      await screen.findByText(/^Create a new AI Testing Project$/i);
      const projNameInput: HTMLInputElement =
        await screen.findByPlaceholderText(
          /^Enter name of this project e.g. Credit Scoring Model Tests$/i
        );
      const descInput: HTMLInputElement = await screen.findByPlaceholderText(
        /^Enter Project Description e.g. To test whether the classification model is fair towards all groups with respect to gender, robust against unexpected input and explainable.$/i
      );
      const reportTitleInput: HTMLInputElement =
        await screen.findByPlaceholderText(
          /^Enter the title to be used for the generated report$/i
        );
      const companyInput: HTMLInputElement = await screen.findByPlaceholderText(
        /^Enter the company name$/i
      );
      const useProjectNameCheckbox = container.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      await userEvent.type(projNameInput, 'Test Project');
      await userEvent.type(descInput, 'Test Description');
      await userEvent.type(reportTitleInput, 'Test Report Name');
      await userEvent.type(companyInput, 'Test Company Pte Ltd');
      jest.runAllTimers();
      await userEvent.click(useProjectNameCheckbox);
      const nextBtn = await screen.findByText(/^Next$/i);
      await user.click(nextBtn.parentElement as HTMLDivElement);
      await waitFor(() => {
        expect(reportTitleInput.value).toBe(projNameInput.value);
        expect(screen.queryByText(/^Select Report Template$/i)).not.toBeNull();
      });
      expect(container.querySelector('.layoutContentArea')).toMatchSnapshot(
        'Select Report Template Screen'
      );
    });
  });

  describe('Report Designer Screen', () => {
    it('should render Report Designer screen', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <MockProviders apolloMocks={mockGqlDataE2E}>
          <ProjectCreatePageWrapper />
        </MockProviders>
      );
      await screen.findByText(/^Create a new AI Testing Project$/i);
      const projNameInput: HTMLInputElement =
        await screen.findByPlaceholderText(
          /^Enter name of this project e.g. Credit Scoring Model Tests$/i
        );
      const descInput: HTMLInputElement = await screen.findByPlaceholderText(
        /^Enter Project Description e.g. To test whether the classification model is fair towards all groups with respect to gender, robust against unexpected input and explainable.$/i
      );
      const reportTitleInput: HTMLInputElement =
        await screen.findByPlaceholderText(
          /^Enter the title to be used for the generated report$/i
        );
      const companyInput: HTMLInputElement = await screen.findByPlaceholderText(
        /^Enter the company name$/i
      );
      await userEvent.type(projNameInput, 'Test Project');
      await userEvent.type(descInput, 'Test Description');
      await userEvent.type(reportTitleInput, 'Test Report Name');
      await userEvent.type(companyInput, 'Test Company Pte Ltd');
      jest.runAllTimers();
      const nextBtn = await screen.findByText(/^Next$/i);
      await user.click(nextBtn.parentElement as HTMLDivElement);
      await screen.findByText(/^Select Report Template$/i);
      await screen.findByText(
        /^No Templates Found. Select 'Blank Canvas' and click 'Next'$/i
      );
      const blankCard = await screen.findByText(/^Blank Canvas$/i);
      await userEvent.click(blankCard);
      await waitFor(() => {
        expect(container.querySelector('.card__highlighted')).toBeDefined();
      });
      await userEvent.click(nextBtn);
      await screen.queryByText(/^Design Report$/i);
      // 1 Project name in left panel and another should be in global vars panel
      expect((await screen.findAllByText(/^Test Project$/i)).length).toBe(2);
      expect(container.querySelector('.layoutContentArea')).toMatchSnapshot(
        'Report Designer Screen'
      ); // snapshot without header, because header has dynamic autosave time display
    });

    it('should filter widgets by text search', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <MockProviders apolloMocks={mockGqlDataE2E}>
          <ProjectCreatePageWrapper />
        </MockProviders>
      );
      const projNameInput: HTMLInputElement =
        await screen.findByPlaceholderText(
          /^Enter name of this project e.g. Credit Scoring Model Tests$/i
        );
      await userEvent.type(projNameInput, 'Test Project');
      jest.runAllTimers();
      const nextBtn = await screen.findByText(/^Next$/i);
      await user.click(nextBtn.parentElement as HTMLDivElement);
      await screen.findByText(/^Select Report Template$/i);
      const blankCard = await screen.findByText(/^Blank Canvas$/i);
      await userEvent.click(blankCard);
      await waitFor(() => {
        expect(container.querySelector('.card__highlighted')).toBeDefined();
      });
      await userEvent.click(nextBtn);
      await screen.queryByText(/^AI Verify Stock Decorators$/i);
      await screen.queryByText(/^Mock Plugin for Unit Test$/i);
      await screen.queryByText(/^Test Plugin$/i);
      const searchInput: HTMLInputElement = await screen.findByPlaceholderText(
        /^Search Report Widgets$/i
      );
      await user.type(searchInput, 'MAE');
      expect(
        await screen.queryByText(/^AI Verify Stock Decorators$/i)
      ).toBeNull();
      expect(await screen.queryByText(/^Test Plugin$/i)).toBeNull();
      await screen.findByText(/^Mock Plugin for Unit Test$/i);
      await screen.findByText(/^Interpretation \(MAE\)$/i);
    });

    it('should place widget on canvas, highlight the widget and display widget name and delete button', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch');
      fetchSpy.mockImplementation(
        jest.fn(() =>
          Promise.resolve({
            json: () => Promise.resolve(widgetMdxBundleResponse),
          })
        ) as jest.Mock
      );
      const user = userEvent.setup();
      const { container } = render(
        <MockProviders apolloMocks={mockGqlDataE2E}>
          <ProjectCreatePageWrapper />
        </MockProviders>
      );
      const projNameInput: HTMLInputElement =
        await screen.findByPlaceholderText(
          /^Enter name of this project e.g. Credit Scoring Model Tests$/i
        );
      await userEvent.type(projNameInput, 'Test Project');
      jest.runAllTimers();
      const nextBtn = await screen.findByText(/^Next$/i);
      await user.click(nextBtn.parentElement as HTMLDivElement);
      await screen.findByText(/^Select Report Template$/i);
      const blankCard = await screen.findByText(/^Blank Canvas$/i);
      await userEvent.click(blankCard);
      await waitFor(() => {
        expect(container.querySelector('.card__highlighted')).toBeDefined();
      });
      await userEvent.click(nextBtn);
      await screen.queryByText(/^Design Report$/i);
      await screen.findByText(/^Interpretation \(MAE\)$/i);
      const gridLayoutArea = container.querySelector(
        GRID_LAYOUT_CLASSNAME
      ) as HTMLDivElement;
      expect(gridLayoutArea.children.length).toBe(0);
      const maeInterWidget = container.querySelector(
        '[data-test-id="draggableWidget-aiverify.test.mock_test_plugin1:widget_cid_1"]'
      );
      // stub date down to return mock date, which is used as a 'key' value when widget added to canvas
      const dateNowStub = jest.fn(() => MOCK_DATE_WIDGET_1);
      const actualDateNowFn = Date.now.bind(global.Date);
      global.Date.now = dateNowStub;

      fireEvent.dragStart(maeInterWidget as Element, {
        dataTransfer: { setData: (_str: string) => undefined },
        clientX: 100,
        clientY: 200,
        screenX: -1500,
        screenY: 200,
        x: 100,
        y: 200,
      });

      fireEvent.dragOver(gridLayoutArea as Element, {
        clientX: 100,
        clientY: 200,
        screenX: 600,
        screenY: 200,
        x: 200,
        y: 200,
      });

      await waitFor(() => {
        expect(container.querySelector(GRID_ITEM_CLASSNAME)).not.toBeNull();
      });

      fireEvent.drop(gridLayoutArea as Element, {
        clientX: 100,
        clientY: 200,
        screenX: 600,
        screenY: 200,
        x: 300,
        y: 500,
      });

      //widget should be on canvas
      await waitFor(() => {
        expect(container.querySelector('.widgetContainer')).not.toBeNull();
      });

      global.Date.now = actualDateNowFn;

      expect(gridLayoutArea.children.length).toBe(1);
      //snapshot of widget
      expect(container.querySelector('.widgetContainer')).toMatchSnapshot(
        'widget-on-canvas'
      );

      //widget is highlighted. It's name tag and delete button should be available
      // expect(container.querySelector('.menuContainer')).not.toBeNull();
      // expect(
      //   (container.querySelector('.gridItem_title') as HTMLElement).textContent
      // ).toBe('Fairness for Regression - Interpretation (MAE)');
      // expect(container.querySelector('.gridItem_btnWrapper')).not.toBeNull();
      // expect(container.querySelector('.canvas_item_highlight')).not.toBeNull();

      //Snapshot widget properties panel
      //NaN x & y in snapshot is fine. We are rendering in memory. Have not figured out how to mock the x/y positions.
      expect(
        container.querySelector('#aivWidgetPropertiesPanel')
      ).toMatchSnapshot('widget-properties-panel');

      //color picker 1
      await user.click(container.querySelectorAll('.colorBox')[0]);
      expect(container.querySelector('.aiv-colorpicker')).not.toBeNull();
      await user.click(container);
      expect(container.querySelector('.aiv-colorpicker')).toBeNull();

      //color picker 2
      await user.click(container.querySelectorAll('.colorBox')[1]);
      expect(container.querySelector('.aiv-colorpicker')).not.toBeNull();
      await user.click(container);
      expect(container.querySelector('.aiv-colorpicker')).toBeNull();

      //widget highlight, name tag and delete button should disappear when outside clicked
      await user.click(container);
      expect(container.querySelector('.menuContainer')).toBeNull();
      expect(container.querySelector('.gridItem_title')).toBeNull();
      expect(container.querySelector('.gridItem_btnWrapper')).toBeNull();
      expect(container.querySelector('.canvas_item_highlight')).toBeNull();

      //test to run
      expect(
        (container.querySelector('.testsCountChip') as HTMLElement).textContent
      ).toBe('1');
      expect(
        (
          await screen.findAllByText(
            /^Fairness Metrics Toolbox for Regression$/i
          )
        ).length
      ).toBe(1);
    });

    it('should toggle canvas grid and add / delete pages', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch');
      fetchSpy.mockImplementation(
        jest.fn(() =>
          Promise.resolve({
            json: () => Promise.resolve(widgetMdxBundleResponse),
          })
        ) as jest.Mock
      );
      const user = userEvent.setup();
      const { container } = render(
        <MockProviders apolloMocks={mockGqlDataE2E}>
          <ProjectCreatePageWrapper />
        </MockProviders>
      );
      const projNameInput: HTMLInputElement =
        await screen.findByPlaceholderText(
          /^Enter name of this project e.g. Credit Scoring Model Tests$/i
        );
      await userEvent.type(projNameInput, 'Test Project');
      jest.runAllTimers();
      const nextBtn = await screen.findByText(/^Next$/i);
      await user.click(nextBtn.parentElement as HTMLDivElement);
      await screen.findByText(/^Select Report Template$/i);
      const blankCard = await screen.findByText(/^Blank Canvas$/i);
      await userEvent.click(blankCard);
      await waitFor(() => {
        expect(container.querySelector('.card__highlighted')).toBeDefined();
      });
      await userEvent.click(nextBtn);
      await screen.queryByText(/^Design Report$/i);
      await screen.findByText(/^Interpretation \(MAE\)$/i);
      const gridLayoutArea = container.querySelector(
        GRID_LAYOUT_CLASSNAME
      ) as HTMLDivElement;
      expect(gridLayoutArea.children.length).toBe(0);
      const maeInterWidget = container.querySelector(
        '[data-test-id="draggableWidget-aiverify.test.mock_test_plugin1:widget_cid_1"]'
      );

      // stub date down to return mock date, which is used as a 'key' value when widget added to canvas
      const dateNowStub = jest.fn(() => MOCK_DATE_WIDGET_1);
      const actualDateNowFn = Date.now.bind(global.Date);
      global.Date.now = dateNowStub;

      fireEvent.dragStart(maeInterWidget as Element, {
        dataTransfer: { setData: (_str: string) => undefined },
        clientX: 100,
        clientY: 200,
        screenX: -1500,
        screenY: 200,
        x: 100,
        y: 200,
      });

      fireEvent.dragOver(gridLayoutArea as Element, {
        clientX: 100,
        clientY: 200,
        screenX: 600,
        screenY: 200,
        x: 200,
        y: 200,
      });

      await waitFor(() => {
        expect(container.querySelector(GRID_ITEM_CLASSNAME)).not.toBeNull();
      });

      fireEvent.drop(gridLayoutArea as Element, {
        clientX: 100,
        clientY: 200,
        screenX: 600,
        screenY: 200,
        x: 300,
        y: 500,
      });

      //widget should be on canvas
      await waitFor(() => {
        expect(container.querySelector('.widgetContainer')).not.toBeNull();
      });

      global.Date.now = actualDateNowFn;

      const topMenuIcons = container.querySelectorAll(
        '.canvas_topbar .iconBtn'
      );
      expect(topMenuIcons.length).toBe(4);

      //grid toggle
      expect(container.querySelector('.canvas_grid')).not.toBeNull();
      await user.click(topMenuIcons[0]);
      expect(container.querySelector('.canvas_grid')).toBeNull();

      //multiple pages
      expect(container.querySelectorAll('.MuiPaginationItem-page').length).toBe(
        1
      );
      await user.click(topMenuIcons[2]);
      const addPageElems = await screen.findAllByText(/^Add Page$/i);
      await user.click(addPageElems[1]);
      const pageNumbers = container.querySelectorAll('.MuiPaginationItem-page');
      expect(pageNumbers.length).toBe(2);
      expect(gridLayoutArea.children.length).toBe(0); //new page has no widget
      await user.click(pageNumbers[0]);
      expect(gridLayoutArea.children.length).toBe(1); //back on page 1 which has 1 widget

      //delete page 1
      await user.click(topMenuIcons[1]);
      await screen.findByText(/^Delete Page$/i);
      await user.click(await screen.findByText(/^Proceed$/i));
      expect(container.querySelectorAll('.MuiPaginationItem-page').length).toBe(
        1
      );
      expect(gridLayoutArea.children.length).toBe(0); //remaining page has no widget
    });
  });
});
