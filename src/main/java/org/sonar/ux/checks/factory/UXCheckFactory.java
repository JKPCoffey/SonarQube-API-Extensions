package org.sonar.ux.checks.factory;

import data.checks.Check;
import data.relation.CheckRelation;
import data.relation.CheckRelationFactory;

/**
 * Check classes are seperated into a public facing class with simple method signatures and a private implementation class which provides the class's functionality.<p>
 * This class bridges the gap between these public and private class.
 * @author Jack Coffey
 */
public abstract class UXCheckFactory 
{
	private UXCheckFactory()
	{
		//Page intentionally left blank to prevent instantiation. Even though this is an abstract class, Java provides an implicit default constructor.
	}
	
	/**
	 * This method returns an object of a class which implements a specified Check.
	 * @param <T> class which we know is a subclass of Check.
	 * @param checkClass A Class object of a class which extends the Check class.
	 * @return The implementation class which represents the provided Check class.
	 */
	@SuppressWarnings("unchecked")
	public static <T extends Check> Check getInstance(Class<T> checkClass)
	{
		return ((CheckRelation<Check, String>)CheckRelationFactory.getRelation(CheckRelationFactory.IMPL_CHECK)).getKeys(checkClass.getSimpleName())[0];
	}
}
