class MiqDecorator < SimpleDelegator
  include QuadiconHelper::Decorator

  class << self
    def for(klass)
      decorator = nil

      while decorator.nil? && klass != ApplicationRecord && !klass.nil?
        decorator = "#{klass.name}Decorator".safe_constantize
        klass = klass.superclass
      end

      decorator
    end

    # Initialize these two attributes with default to nil
    attr_reader :fonticon, :fileicon
  end

  # Call the class methods with identical names if these are not set
  delegate :fonticon, :to => :class
  delegate :fileicon, :to => :class

  protected

  def compliance_image(policies)
    {
      :fileicon => compliance_img(self, policies),
      :tooltip  => passes_profiles?(get_policies)
    }
  end

  def total_snapshots
    {
      :text => ERB::Util.h(v_total_snapshots)
    }
  end
end

module MiqDecorator::Instance
  def decorate
    @_decorator ||= MiqDecorator.for(self.class).try(:new, self)
  end
end

module MiqDecorator::Klass
  def decorate
    @_decorator ||= MiqDecorator.for(self)
  end
end
