package data.relation;

/**
 * A factory class for the CheckRelation type. 
 * @author Jack Coffey
 */
public abstract class CheckRelationFactory
{
	public static final String CHECK_SUBDOMAIN = "check sub";
	public static final String SUBDOMAIN_DOMAIN = "sub domain";
	public static final String IMPL_CHECK = "Implementations";
	
	private CheckRelationFactory()
	{
		//Page intentionally left blank to prevent instantiation. Even though this is an abstract class, Java provides an implicit default constructor.
	}
	
	/**
	 * The factory method returning a subclass of the CheckRelation class relative to a provided String type.
	 * @param type A String type representing the requested subclass.
	 * @return An instance of a CheckRelation subclass.
	 * @throws IllegalArgumentException if the provided type does not match this class's constant type Strings.
	 */
	public static CheckRelation getRelation(String type) throws IllegalArgumentException
	{
		CheckRelation<?, ?> result = null;
		
		if(type.equals(CHECK_SUBDOMAIN))
			result = new CheckSubdomainRelation();
		
		else if(type.equals(SUBDOMAIN_DOMAIN))
			result = new SubdomainDomainRelation();
		
		else if(type.equals(IMPL_CHECK))
			result = new ImplementationCheckRelation();
		
		else
			throw new IllegalArgumentException("The provided type must be one of this class's constant type Strings.");
		
		return result;
	}
}
