import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the name and every section', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.getAttribute('aria-label')).toBe('Sachin Budni');
    for (const id of ['home', 'about', 'experience', 'skills', 'projects', 'contact']) {
      expect(el.querySelector('#' + id)).withContext(id).not.toBeNull();
    }
  });
});
