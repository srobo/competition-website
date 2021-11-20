task :clean do
  sh('rm -rf _site')
end

task :deep_clean => [:clean] do
  sh('rm -rf gems')
end

task :dependencies do
  sh('bundle install --path gems')
end

file '_local.yml' do
  touch '_local.yml'
end

[
  'js/lib/angular-ui-select2/.git',
  'js/lib/angular-storage/.git',
  'js/lib/angularjs-ordinal-filter/.git',
  '_sass/brand/.git',
].each { |x|
  file x do
    sh('git submodule update --init')
  end
}

task :submodules => [
  'js/lib/angular-ui-select2/.git',
  'js/lib/angular-storage/.git',
  'js/lib/angularjs-ordinal-filter/.git',
  '_sass/brand/.git',
]

task :dev => [:dependencies, :submodules, :'_local.yml'] do
  sh('bundle exec jekyll serve --drafts --config _config.yml,_local.yml')
end
