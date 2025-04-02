import React, { useCallback, useContext } from 'react';
import { Filter } from './types';
import classNames from 'classnames';
import { MainContext } from '../../ContextProvider/ContextProvider';
import { deleteTodo } from '../../api/todos';
import callError from '../../utils/callError';

const Footer: React.FC = () => {
  const context = useContext(MainContext);
  const { todos, setTodos, filter, setFilter, setError, setLoadingIds } =
    context;

  const isClearDisabled = !todos.some(todo => todo.completed);

  const handleFilterClick = useCallback(
    (event: React.MouseEvent): void => {
      const element = event.target as HTMLElement;

      setFilter(element.dataset.cy as Filter);
    },
    [setFilter],
  );

  const handleClearCompletedClick = useCallback(() => {
    const completedTodos = todos.filter(todo => todo.completed);

    setLoadingIds(completedTodos.map(todo => todo.id));

    Promise.allSettled(completedTodos.map(todo => deleteTodo(todo.id)))
      .then(res => {
        setLoadingIds([0]);

        const deletedTodos = completedTodos.filter((_t, index) => {
          return res[index].status === 'fulfilled';
        });

        if (deletedTodos.length < completedTodos.length) {
          callError(setError, 'delete');
        }

        setTodos(todos.filter(todo => !deletedTodos.includes(todo)));
      })
      .catch(() => callError(setError, 'delete'));
  }, [todos, setLoadingIds, setError, setTodos]);

  const activeNumbers = todos.filter(todo => !todo.completed).length;

  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {`${activeNumbers} items left`}
      </span>

      {/* Active link should have the 'selected' class */}
      <nav className="filter" data-cy="Filter">
        <a
          href="#/"
          className={classNames('filter__link', {
            selected: filter === 'FilterLinkAll',
          })}
          data-cy="FilterLinkAll"
          onClick={handleFilterClick}
        >
          All
        </a>

        <a
          href="#/active"
          className={classNames('filter__link', {
            selected: filter === 'FilterLinkActive',
          })}
          data-cy="FilterLinkActive"
          onClick={handleFilterClick}
        >
          Active
        </a>

        <a
          href="#/completed"
          className={classNames('filter__link', {
            selected: filter === 'FilterLinkCompleted',
          })}
          data-cy="FilterLinkCompleted"
          onClick={handleFilterClick}
        >
          Completed
        </a>
      </nav>

      {/* this button should be disabled if there are no completed todos */}
      <button
        type="button"
        className="todoapp__clear-completed"
        data-cy="ClearCompletedButton"
        disabled={isClearDisabled}
        onClick={handleClearCompletedClick}
      >
        Clear completed
      </button>
    </footer>
  );
};

export default Footer;
