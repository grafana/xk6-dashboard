export module dashboard {
  /**
   * Dashboard configuration.
   */
  export interface Config {
    /** Dashboard title */
    title: string;
    /** Tab definitions */
    tabs: Tab[];
  }

  /**
   * Dashboard tab definition.
   */
  export interface Tab {
    /** tab id */
    id: string;
    /** tab title  */
    title: string;
    /** short description */
    description?: string;
    /** list of panel definitions */
    panels: Panel[];
    /** list of chart definitions */
    charts: Chart[];
    /** event name, "snapshot" or "cumulative" */
    event: string;
    /** should the tab include in report or no */
    report?: boolean;
  }

  /**
   * Dashboard chart definition.
   */
  export interface Chart {
    /** chart id */
    id: string;
    /** chart title */
    title: string;
    /** series definitions */
    series: Record<string, Serie>; // should be an array
    /** axe definitions */
    axes?: Axe[];
    /** scale definitions  */
    scales?: Scale[];
    /** chart hight, default 250 */
    height?: any;
  }

  /** Chart data serie definition. */
  export interface Serie {
    /** label used in legend */
    label: string;
    /** scale reference */
    scale?: string;
    /** format used in legend */
    format: string;
    /** line width */
    width?: number;
    /** is it a rate or not */
    rate?: boolean;
  }

  /** Chart axis definition */
  export interface Axe {
    /** format using in labels */
    format?: string;
    /** side index (0=left, 1=right) */
    side?: number;
    /** scale reference */
    scale?: string;
  }

  export interface Scale {}

  /** Dashboard panel definition. */
  export interface Panel {
    /** panel id */
    id: string;
    /** panel title */
    title: string;
    /** metric name to display */
    metric: string;
    /** format */
    format?: string;
  }
}

declare global {
  interface Array<T> {
  /**
   * Search for an array element that has a given id property value.
   * @param {string} id the id for the search
   * @returns {T} the first element whose id property matches or is undefined if there are no results
   */
    getById(id: string): T;
  }
}
