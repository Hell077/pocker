import React, { useState, ReactNode } from "react";
import styles from "./Tabs.module.css";

type TabProps = {
  label: string;
  value: string;
  children?: ReactNode;
};

type TabsProps = {
  defaultValue: string;
  children: ReactNode;
};

export const Tab = ({ children }: TabProps) => {
  return <>{children}</>;
};

export const Tabs = ({ defaultValue, children }: TabsProps) => {
  const [active, setActive] = useState(defaultValue);
  const tabs = React.Children.toArray(children) as React.ReactElement<TabProps>[];

  return (
    <div className={styles.tabs}>
      <div className={styles.nav}>
        {tabs.map((tab) => (
          <button
            key={tab.props.value}
            onClick={() => setActive(tab.props.value)}
            className={active === tab.props.value ? styles.active : ""}
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      <div className={styles.panel}>
        {tabs.map((tab) =>
          tab.props.value === active ? (
            <div key={tab.props.value}>{tab.props.children}</div>
          ) : null
        )}
      </div>
    </div>
  );
};
