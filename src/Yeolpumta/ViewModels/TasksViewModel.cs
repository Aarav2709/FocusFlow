using System;
using System.Collections.ObjectModel;
using System.Linq;
using Yeolpumta.Models;
using Yeolpumta.Services;

namespace Yeolpumta.ViewModels
{
    public class TasksViewModel : BaseViewModel
    {
        private readonly TasksService _service;
        public ObservableCollection<TaskItem> Tasks { get; } = new();
        public ObservableCollection<TaskItem> Upcoming { get; } = new();

        public TaskItem? Selected
        {
            get => _selected;
            set
            {
                SetProperty(ref _selected, value);
                if (value != null)
                {
                    EditTitle = value.Title;
                    EditDescription = value.Description ?? string.Empty;
                    EditDue = value.DueDate;
                    EditPriority = value.Priority;
                    EditCompleted = value.IsCompleted;
                }
            }
        }
        private TaskItem? _selected;

        public string EditTitle { get => _editTitle; set => SetProperty(ref _editTitle, value); }
        private string _editTitle = string.Empty;
        public string EditDescription { get => _editDesc; set => SetProperty(ref _editDesc, value); }
        private string _editDesc = string.Empty;
        public DateTime? EditDue { get => _editDue; set => SetProperty(ref _editDue, value); }
        private DateTime? _editDue = null;
        public TaskPriority EditPriority { get => _editPriority; set => SetProperty(ref _editPriority, value); }
        private TaskPriority _editPriority = TaskPriority.Medium;
        public bool EditCompleted { get => _editCompleted; set => SetProperty(ref _editCompleted, value); }
        private bool _editCompleted = false;

        public RelayCommand NewCommand { get; }
        public RelayCommand SaveCommand { get; }
        public RelayCommand DeleteCommand { get; }
        public RelayCommand ToggleCompleteCommand { get; }

        public TasksViewModel(TasksService service)
        {
            _service = service;
            NewCommand = new RelayCommand(_ => NewTask());
            SaveCommand = new RelayCommand(_ => SaveTask(), _ => !string.IsNullOrWhiteSpace(EditTitle));
            DeleteCommand = new RelayCommand(_ => DeleteTask(), _ => Selected != null && Selected.Id != 0);
            ToggleCompleteCommand = new RelayCommand(_ => ToggleComplete(), _ => Selected != null && Selected.Id != 0);
            Load();
        }

        private void Load()
        {
            Tasks.Clear();
            foreach (var t in _service.GetAll()) Tasks.Add(t);

            Upcoming.Clear();
            foreach (var u in _service.GetUpcoming()) Upcoming.Add(u);

            Selected = Tasks.FirstOrDefault();
        }

        private void NewTask()
        {
            Selected = new TaskItem();
            EditTitle = string.Empty;
            EditDescription = string.Empty;
            EditDue = null;
            EditPriority = TaskPriority.Medium;
            EditCompleted = false;
        }

        private void SaveTask()
        {
            if (Selected == null || Selected.Id == 0)
            {
                var item = new TaskItem
                {
                    Title = EditTitle,
                    Description = string.IsNullOrWhiteSpace(EditDescription) ? null : EditDescription,
                    DueDate = EditDue,
                    Priority = EditPriority,
                    IsCompleted = EditCompleted
                };
                _service.Create(item);
            }
            else
            {
                Selected.Title = EditTitle;
                Selected.Description = string.IsNullOrWhiteSpace(EditDescription) ? null : EditDescription;
                Selected.DueDate = EditDue;
                Selected.Priority = EditPriority;
                Selected.IsCompleted = EditCompleted;
                _service.Update(Selected);
            }
            Load();
        }

        private void DeleteTask()
        {
            if (Selected != null && Selected.Id != 0)
            {
                _service.Delete(Selected.Id);
                Load();
            }
        }

        private void ToggleComplete()
        {
            if (Selected != null && Selected.Id != 0)
            {
                Selected.IsCompleted = !Selected.IsCompleted;
                _service.Update(Selected);
                Load();
            }
        }
    }
}
